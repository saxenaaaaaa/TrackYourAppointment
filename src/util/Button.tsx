import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';

type ButtonProps = {
    text: string;
    textColor?: string;
    backgroundColor?: string;
    onPress: () => void;
}

export default function Button({ text, textColor = "white", backgroundColor = "black", onPress }: ButtonProps) {
  return (
    <Pressable style={[styles.button, {backgroundColor: backgroundColor}]} onPress={onPress}>
      <Text style={[styles.text, {color: textColor}]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3
    },
    text: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25
    },
  });