import React from 'react';
import {Button, Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class CounterScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      counter: 0,
    };
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'Counter',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
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

  inc = () => {
    this.setState({
      counter: this.state.counter + 1,
    });
  };

  dec = () => {
    this.setState({
      counter: this.state.counter - 1,
    });
  };

  render() {
    const {navigate} = this.props.navigation;
    return (
      <View style={styles.container}>
        <Text>{this.state.counter}</Text>
        <View style={styles.top40}>
          <Button title="+" onPress={() => this.inc()} />
        </View>
        <View style={styles.top40}>
          <Button title="-" onPress={() => this.dec()} />
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
