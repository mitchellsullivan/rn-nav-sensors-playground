import React from 'react';
import {
    Button,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SensorView from './SensorView';

const axis = ["x", "y", "z"];

const availableSensors = {
    // accelerometer: axis,
    gyroscope: axis,
    // magnetometer: axis,
    // barometer: ["pressure"]
};

const viewComponents = Object.entries(availableSensors).map(([name, values]) =>
    SensorView(name, values)
);


export default class SensorsScreen extends React.Component {
    constructor() {
        super();
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Sensors',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Icon
                        style={{ marginLeft: 15, padding: 10 }}
                        name="bars"
                        size={25}
                        color="#FFF"
                    />
                </TouchableOpacity>
            ),
        };
    };

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <ScrollView>
                    {viewComponents.map((Comp, index) => <Comp key={index} />)}
                </ScrollView>
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
  