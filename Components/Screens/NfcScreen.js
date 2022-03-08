import React from 'react';
import {Button, Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import {UTF8} from 'convert-string';

export default class NfcScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tagData: '[None Yet]',
      listening: false,
    };
  }

  componentDidMount() {
    NfcManager.start();
    const that = this;
    NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
      this.setState({
        listening: false,
      });
    });
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      console.log('tag', JSON.stringify(tag));
      if (!tag.ndefMessage) {
        return;
      }
      const payload = tag.ndefMessage[0].payload;
      const dec = UTF8.bytesToString(payload).replace(/[\u0000]/g, '');
      console.log('tag payload:', dec);
      that.setState({
        tagData: dec,
      });
      NfcManager.setAlertMessageIOS('Tag Record 0: ' + dec);
      NfcManager.unregisterTagEvent().catch(() => 0);
    });
  }

  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  _cancel = async () => {
    await NfcManager.unregisterTagEvent();
    this.setState({
      listening: false,
    });
  };

  _test = async () => {
    if (this.state.listening) {
      return;
    }
    this.setState({
      listening: true,
    });
    try {
      await NfcManager.registerTagEvent();
    } catch (ex) {
      console.warn('ex', ex);
      NfcManager.unregisterTagEvent().catch(() => 0);
    }
  };

  static navigationOptions = ({navigation}) => {
    return {
      title: 'NFC',
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

  render() {
    const {navigate} = this.props.navigation;
    return (
      <View style={styles.container}>
        <Text style={{alignSelf: 'center'}}>Data: {this.state.tagData}</Text>
        <View style={styles.top40}>
          <Button
            title={this.state.listening ? 'Reading...' : 'Test Read'}
            onPress={() => this._test()}
          />
        </View>
        <View style={styles.top40}>
          <Button title="Cancel Test Read" onPress={() => this._cancel()} />
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
