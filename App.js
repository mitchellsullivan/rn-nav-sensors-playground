import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';

import {
  HomeScreen,
  ProfileScreen,
  CounterScreen,
  BleDevicesScreen,
  ModalScreen,
  CameraScreen,
  ViewPhotoScreen,
  NfcScreen,
  SensorsScreen,
} from './Components/Screens';

const defaultOptions = {
  headerStyle: {
    backgroundColor: '#263238',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

const HomeStack = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Profile: { screen: ProfileScreen },
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: defaultOptions,
  },
);

const HomeModalStack = createStackNavigator(
  {
    Home: { screen: HomeStack },
    Info: { screen: ModalScreen },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    navigationOptions: {
      drawerLabel: 'Home',
    },
  },
);

const CounterStack = createStackNavigator(
  {
    Counter: { screen: CounterScreen },
  },
  {
    initialRouteName: 'Counter',
    defaultNavigationOptions: defaultOptions,
    navigationOptions: {
      drawerLabel: 'Counter',
    },
  },
);

const BleDevicesStack = createStackNavigator(
  {
    BleDevices: { screen: BleDevicesScreen },
  },
  {
    initialRouteName: 'BleDevices',
    defaultNavigationOptions: defaultOptions,
    navigationOptions: {
      drawerLabel: 'BLE',
    },
  },
);

const CameraStack = createStackNavigator(
  {
    Camera: { screen: CameraScreen, },
    ViewPhoto: { screen: ViewPhotoScreen, },
  },
  {
    initialRouteName: 'Camera',
    defaultNavigationOptions: defaultOptions,
    navigationOptions: {
      drawerLabel: 'Camera',
    },
  },
);

const NfcStack = createStackNavigator(
  {
    Nfc: { screen: NfcScreen, },
  },
  {
    initialRouteName: 'Nfc',
    defaultNavigationOptions: defaultOptions,
    navigationOptions: {
      drawerLabel: 'NFC',
    },
  },
);

const SensorsStack = createStackNavigator(
  {
    Sensors: { screen: SensorsScreen, },
  },
  {
    initialRouteName: 'Sensors',
    defaultNavigationOptions: defaultOptions,
    navigationOptions: {
      drawerLabel: 'Sensors',
    },
  },
);

const DrawerNavigator = createDrawerNavigator({
  Main: {
    screen: HomeModalStack,
  },
  Counter: {
    screen: CounterStack,
  },
  BleDevices: {
    screen: BleDevicesStack,
  },
  Camera: {
    screen: CameraStack,
  },
  Nfc: {
    screen: NfcStack,
  },
  Sensors: {
    screen: SensorsStack,
  },
},
  {
    initialRouteName: 'BleDevices',
  });

export default createAppContainer(DrawerNavigator);
