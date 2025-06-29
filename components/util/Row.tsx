import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'



const Row = (props: ViewProps) => {
    const {style, ...rest} = props
    return (
        <View style={[styles.container, style]} {...rest} />
    )
}

export default Row

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center"
    }
})