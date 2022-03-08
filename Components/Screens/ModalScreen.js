import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

export default class ModalScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.mainText}>
          This is a my test app. Thank you. Patent Pending.
        </Text>
        <Button
          onPress={() => this.props.navigation.goBack()}
          title="Dismiss"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {fontSize: 16, margin: 20},
});
