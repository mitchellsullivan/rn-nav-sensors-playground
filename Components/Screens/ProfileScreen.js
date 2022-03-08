import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class ProfileScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Profile',
    };
  };

  render() {
    const {navigate} = this.props.navigation;
    const {navigation} = this.props;
    return (
      <View style={styles.container}>
        <Text>Hello, {JSON.stringify(navigation.getParam('name'))}</Text>
        <View style={styles.top40}>
          <Button title="Go Home" onPress={() => navigate('Home')} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    flexDirection: 'column',
    alignItems: 'center',
  },
  top40: {
    marginTop: 40,
  },
});
