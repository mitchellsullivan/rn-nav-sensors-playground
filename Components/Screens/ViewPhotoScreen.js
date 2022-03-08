import React from 'react';
import {Button, View, StyleSheet, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {RNS3} from 'react-native-s3-upload';

export default class ViewPhotoScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'View Photo',
    };
  };

  uploadImage = async uri => {
    const file = {
      uri: uri,
      name: '' + Math.random() * 10 + '.png',
      type: 'image/png',
    };

    const options = {
      bucket: 'test-mobile-app-upload',
      region: 'us-east-1',
      accessKey: '',
      secretKey: '',
      successActionStatus: 201,
    };

    try {
      let response = await RNS3.put(file, options);
      console.log(response.status);
      if (response.status !== 201) {
        throw new Error('Failed to upload image to S3');
      }
      console.log(response.body);
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const {navigate} = this.props.navigation;
    const {navigation} = this.props;
    const uri = navigation.getParam('photoUri');
    return (
      <View style={{marginTop: 40}}>
        <Image style={{width: 200, height: 300}} source={{uri: uri}} />
        <View>
          <Button title="Upload" onPress={() => this.uploadImage(uri)} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
