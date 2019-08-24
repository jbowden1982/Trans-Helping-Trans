import React from 'react';
import { Text, View } from 'native-base';
import { StyleSheet } from 'react-native';

export class Bubble extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let scale, size;

    const {
      color = 'transparent',
      borderColor = 'black',
      borderWidth = 0,
      width = 20,
      height = 20,
      children
    } = this.props;


    if (width > height) {
      size = height;
      scale = {scaleX: width / height}
    } else if (height > width) {
      size = width;
      scale = {scaleY: height / width}
    } else {
      size = width;
      scale = {scaleX: 1};
    }


    return (
      <View style={{
        width: width,
        height: height
      }}>
        <View style={{
          marginTop: height > width ? size / 4 : 0,
          marginLeft: width > height ? size / 4 : 0,
          padding: 0,
          borderColor: borderColor,
          borderWidth: borderWidth,
          width: size,
          height: size  ,
          backgroundColor: color,
          borderRadius: size,
          transform: [ scale ],
        }}>
        </View>
        <View style={{
          position: 'absolute',
          width: width,
          height: height,
          top: 0,
          left: 0,
          padding: 0,
          margin: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {children}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {

  },
  sibling: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
