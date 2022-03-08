import React from 'react';
import {
  Button,
  View,
  Platform,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class HomeScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Welcome',
      drawerLabel: 'Home',
      headerRight: () => (
        <Button
          onPress={() => navigation.navigate('Info')}
          title="Info"
          color={Platform.OS === 'ios' ? '#fff' : null}
        />
      ),
      headerLeft: () => (
        <TouchableOpacity
          // style={{width: 50, height: 50}}
          onPress={() => navigation.openDrawer()}>
          <Icon
            style={{marginLeft: 15, padding: 10}}
            name="bars"
            size={25}
            color="#FFF"
          />
        </TouchableOpacity>
      ),
    };
  };

  render() {
    const {navigate} = this.props.navigation;
    return (
      <View style={{marginTop: 40,}}>
        <StatusBar barStyle="light-content" />
        <Button
          title="Go to Jane's profile"
          onPress={() => navigate('Profile', {name: 'Jane'})}
        />
      </View>
    );
  }
}
