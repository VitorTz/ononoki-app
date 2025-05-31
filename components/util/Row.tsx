import React from 'react'
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native'


interface RowProps {
    style?: ViewStyle
    children?: React.JSX.Element
}


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