import React from 'react'
import { View, StyleSheet } from 'react-native'
import { DatabaseConnectionTest } from '../../components/test/DatabaseConnectionTest'

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <DatabaseConnectionTest />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
})