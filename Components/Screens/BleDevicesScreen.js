import React from 'react';
import {
  Button,
  View,
  Platform,
  Text,
  NativeModules,
  NativeEventEmitter,
  AppState,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import BleManager from 'react-native-ble-manager';
import {stringToBytes, bytesToString} from 'convert-string';
import * as aesjs from 'aes-js';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SECRET_KEY = [65, 63, 68, 40, 71, 43, 75, 98, 80, 101, 83, 104, 86, 109, 89, 113]


export default class BleDevicesScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      scanning: false,
      peripherals: new Map(),
      appState: '',
      weight: 0,
      connectedItem: {},
      measure: '',
    };

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(
      this,
    );
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(
      this,
    );
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    return {
      title: 'BLE Devices',
      drawerLabel: 'BLE',
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

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);

    BleManager.start({showAlert: false});

    this.handlerDiscover = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral,
    );
    this.handlerStop = bleManagerEmitter.addListener(
      'BleManagerStopScan',
      this.handleStopScan,
    );
    this.handlerDisconnect = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral,
    );
    this.handlerUpdate = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ).then(result => {
            if (result) {
              console.log('User accept');
            } else {
              console.log('User refuse');
            }
          });
        }
      });
    }
  }

  handleAppStateChange(nextAppState) {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      BleManager.getConnectedPeripherals([]).then(peripheralsArray => {
        console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({appState: nextAppState});
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({peripherals});
    }
    console.log('Disconnected from ' + data.peripheral);
  }








  handleUpdateValueForCharacteristic(data) {
    const SERVICE_MEASUREMENT_UUID        = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    const CHARACTERISTIC_MEASUREMENT_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
    const CHARACTERISTIC_WRITE_UUID       = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
    const DUMMY_DATE                      = "20191020191501";

    if (data.characteristic != CHARACTERISTIC_MEASUREMENT_UUID) 
      return;
  
    // ON DEVICE READY MESSAGE ... 0xFF 0x00
    if (data.value[0] == 255 && data.value[1] == 0) {
      let prefix = bytesToString([255, 0])
      let sender = stringToBytes(prefix + DUMMY_DATE)

      BleManager.write(this.state.connectedItem.id,
        SERVICE_MEASUREMENT_UUID,
        CHARACTERISTIC_WRITE_UUID,
        sender).then(() => {})
    }
    // OTHER
    else {
      if (data.value.length == 16) {
        let value = Array.from(this.decrypt(data.value, SECRET_KEY));
        
        // ON CONFIRMATION MESSAGE ... 0xFF 0x01
        if (value[0] == 255 && value[1] == 1) {
          for (let i = 3; i <= 14; ++i) {
            value[i] ^= value[15]
          }
          const enc = Array.from(this.encrypt(value, SECRET_KEY));

          BleManager.write(this.state.connectedItem.id,
            SERVICE_MEASUREMENT_UUID,
            CHARACTERISTIC_WRITE_UUID,
            enc).then(() => { })
        }
        // ON MEASUREMENT MESSAGE ... 0xFF 0x02
        else if (value[0] == 255 && value[1] == 2) {
          const res = bytesToString(value.slice(2))

          this.setState({
            measure: res
          })
        }
      }
    }
  }













  // handleUpdateValueForCharacteristic(data) {
  //   // console.log(JSON.stringify(data));
  //   if (data.characteristic != "6e400003-b5a3-f393-e0a9-e50e24dcca9e") return;
  
  //   // First value from 
  //   if (data.value[0] == 255 && data.value[1] == 0) {
  //     let prefix = bytesToString([255, 0])
  //     let sender = stringToBytes(prefix + "20191020191501")

  //     // console.log("writing date");
  //     BleManager.write(this.state.connectedItem.id,
  //       "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  //       "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
  //       sender).then(() => { console.log("wrote date"); })
  //   }
  //   else {
  //     // console.log("elsed ", data.value);
  //     if (data.value.length == 16) {
  //       let value = Array.from(this.decrypt(data.value, SECRET_KEY));
  //       if (value[0] == 255 && value[1] == 1) {
  //         for (let i = 3; i <= 14; ++i) {
  //           value[i] ^= value[15]
  //         }
  //         // console.log('about to encrypt');
  //         const enc = Array.from(this.encrypt(value, SECRET_KEY))
          
  //         // console.log('about to write ', enc);
  //         BleManager.write(this.state.connectedItem.id,
  //           "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
  //           "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
  //           enc).then(() => { console.log('wrote enc'); })
  //       }
  //       else if (value[0] == 255 && value[1] == 2) {
  //         const res = bytesToString(value.slice(2))
  //         // console.log("MEASURED: " + res);
  //         this.setState({
  //           measure: res
  //         })
  //       }
  //     }
  //   }
  //   // const s = bytesToString(data.value);
  //   // this.setState({
  //   //   weight: s,
  //   // });
  // }

  decrypt(value, key) {
    const aesEcb = new aesjs.ModeOfOperation.ecb(key);
    return aesEcb.decrypt(value);
  }

  encrypt(value, key) {
    const aesEcb = new aesjs.ModeOfOperation.ecb(key);
    return aesEcb.encrypt(value)
  }

  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({scanning: false});
  }

  startScan() {
    if (!this.state.scanning) {
      //this.setState({peripherals: new Map()});
      BleManager.scan([], 3, true).then(results => {
        console.log('Scanning...');
        this.setState({scanning: true});
      });
    }
  }

  retrieveConnected() {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length == 0) {
        console.log('No connected peripherals');
      }
      console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({peripherals});
      }
    });
  }

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    this.setState({peripherals});
  }

  setConn(peripheral) {
    if (!peripheral) {
      return;
    }
    if (peripheral.connected) {
      BleManager.disconnect(peripheral.id);
      return;
    }
    BleManager.connect(peripheral.id).then(() => {
      let peripherals = this.state.peripherals;
      let p = peripherals.get(peripheral.id);
      if (p) {
        p.connected = true;
        peripherals.set(peripheral.id, p);
        this.setState({peripherals});
      }
      console.log('Connected to ' + peripheral.id);
      this.setState({
        connectedItem: peripheral,
      });
      setTimeout(() => {
        BleManager.retrieveServices(peripheral.id).then(peripheralData => {
          console.log(
            'Retrieved peripheral services',
            JSON.stringify(peripheralData),
          );
          // BleManager.readRSSI(peripheral.id).then(rssi => {
          //   console.log('Retrieved actual RSSI value', rssi);
          // });
          
          // bagel 
          BleManager.startNotification(peripheral.id, 
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
            '6e400003-b5a3-f393-e0a9-e50e24dcca9e').then(() => {
              console.log("started notification")
            })

        });
      }, 100);
    });
  }

  weigh() {
    if (!this.state.connectedItem) {
      return;
    }
    const peripheral = this.state.connectedItem;

    var service = 'FFE0';
    var characteristic = 'FFE1';

    setTimeout(() => {
      BleManager.startNotification(peripheral.id, service, characteristic).then(
        () => {
          console.log('Started notification on ' + peripheral.id);
          setTimeout(() => {
            const data = stringToBytes('W\r\n');
            BleManager.writeWithoutResponse(
              peripheral.id,
              service,
              characteristic,
              data,
            ).then(() => {
              console.log('Wrote W');
            });
          }, 500);
        },
        500,
      );
      return;
    });
  }

  renderItem(item) {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableWithoutFeedback onPress={() => this.setConn(item)}>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text style={styles.textDeviceName}>{item.name}</Text>
          <Text style={styles.textRssi}>RSSI: {item.rssi}</Text>
          <Text style={styles.textDeviceId}>{item.id}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  render() {
    const {navigate} = this.props.navigation;
    const list = Array.from(this.state.peripherals.values());

    return (
      <View style={styles.container}>
        {/* <TouchableWithoutFeedback onPress={() => this.startScan()}> */}
        {/* <Text style={styles.primaryButton}> */}
        <Button
          title={`${this.state.scanning ? 'Scanning...' : 'Start Scan'}`}
          onPress={() => this.startScan()}
        />
        <Button
          title='Do Bagel'
          onPress={() => this.bagel()}
        />
        <Text style={{alignSelf: 'center'}}>{this.state.measure}</Text>
        {/* </Text> */}
        {/* </TouchableWithoutFeedback> */}
        {/* <TouchableWithoutFeedback onPress={() => this.retrieveConnected()}>
          <Text style={styles.primaryButton}>
            Retrieve connected peripherals
          </Text>
        </TouchableWithoutFeedback> */}
        {/* <TouchableWithoutFeedback onPress={() => this.weigh()}>
          <Text style={styles.primaryButton}>Weigh</Text>
        </TouchableWithoutFeedback>
        <Text style={styles.weightDisplay}>{this.state.weight}</Text> */}
        {list.length == 0 && (
          <View style={{flex: 1, margin: 20}}>
            <Text style={{textAlign: 'center'}}>No peripherals</Text>
          </View>
        )}
        {list.length > 0 && (
          <FlatList
            style={styles.scroll}
            data={list}
            renderItem={({item}) => this.renderItem(item)}
            keyExtractor={item => item.id}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: window.width,
    height: window.height,
    paddingTop: 20,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    margin: 20,
    marginTop: 10,
  },
  row: {
    marginTop: 2.5,
  },
  primaryButton: {
    marginTop: 0,
    marginBottom: 5,
    margin: 20,
    padding: 16,
    fontSize: 20,
    backgroundColor: '#c8e6c9',
    borderColor: '#519657',
    borderWidth: 1,
  },
  textDeviceName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333333',
    padding: 5,
  },
  textRssi: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333333',
    padding: 2,
  },
  textDeviceId: {
    fontSize: 8,
    textAlign: 'center',
    color: '#333333',
    padding: 2,
    paddingBottom: 10,
  },
  weightDisplay: {
    marginTop: 0,
    margin: 20,
    padding: 20,
    fontSize: 24,
    backgroundColor: '#F0F0F0',
    borderColor: '#333',
    borderWidth: 1,
  },
});
