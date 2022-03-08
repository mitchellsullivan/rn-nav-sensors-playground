import React, { Component } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Sensors from "react-native-sensors";

const Value = ({ name, value }) => (
  <View style={styles.valueContainer}>
    <Text style={styles.valueName}>{name}:</Text>
    <Text style={styles.valueValue}>{value.toFixed(2)}</Text>
  </View>
);

export default function(sensorName, values) {
  const sensor$ = Sensors[sensorName];

  return class SensorView extends Component {
    constructor(props) {
      super(props);

      const initialValue = values.reduce(
        (carry, val) => ({ ...carry, [val]: 0 }),
        {}
      );
      this.state = initialValue;
    }

    componentDidMount() {
      const subscription = sensor$.subscribe(values => {
        let x = values['x'];
        let y = values['y'];
        let z = values['z'];
        let prevX = this.state['x'];
        let prevY = this.state['y'];
        let prevZ = this.state['z'];
        
        let xChanged = Math.abs(x - prevX) > 0.1;
        let yChanged = Math.abs(y - prevY) > 0.1;
        let zChanged = Math.abs(z - prevZ) > 0.1;

        if (xChanged || yChanged || zChanged) {
            this.setState({ ...values });
        }
      });
      this.setState({ subscription });
    }

    componentWillUnmount() {
      this.state.subscription.unsubscribe();
      this.setState({ subscription: null });
    }

    render() {
      return (
        <View style={styles.container}>
          <Text style={styles.headline}>{sensorName} values</Text>
          {values.map(valueName => (
            <Value
              key={sensorName + valueName}
              name={valueName}
              value={this.state[valueName]}
            />
          ))}
        </View>
      );
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
    marginTop: 50
  },
  headline: {
    fontSize: 30,
    textAlign: "left",
    margin: 10
  },
  valueContainer: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  valueValue: {
    width: 200,
    fontSize: 20
  },
  valueName: {
    width: 50,
    fontSize: 20,
    fontWeight: "bold"
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});