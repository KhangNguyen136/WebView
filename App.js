import React from 'react';
import { StyleSheet, SafeAreaView, Text, TextInput, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import react from 'react';
const db = SQLite.openDatabase('db')
const Stack = createNativeStackNavigator();


function WebViewScreen({ route }) {
  const url = route.params.url
  return (
    <WebView style={styles.webViewContainer} source={{ uri: url }} />
  );
}

function HomeScreen({ navigation }) {
  const [IP, setIP] = react.useState('')
  React.useEffect(() => {
    db.transaction(
      tx => {
        tx.executeSql(
          'create table if not exists ip(ID integer primary key, value)'
        )
        tx.executeSql(
          'select value from ip', [],
          (tx, result) => {
            console.log(result.rows.item(0).value)
            if (result.rows.length == 1) {
              setIP(result.rows.item(0).value)
            }
          }
        )
      }
    )
    changeScreenOrientation()
  })
  async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }
  return (
    <SafeAreaView style={styles.container} >
      <Text style={{ fontSize: 20, fontWeight: '500' }}>Enter IP: </Text>
      <TextInput style={styles.input} value={IP} onChangeText={setIP} placeholder={'IP'} keyboardType={'numeric'} />
      <Button title={'Go'} onPress={() => {
        navigation.navigate('WebView', { url: 'https://' + IP + ':8000/' })
        db.transaction(
          tx => {
            tx.executeSql(
              'select value from ip', [],
              (tx, result) => {
                if (result.rows.length == 1) {
                  tx.executeSql(
                    'update ip set value = ? where ID = ?', [IP, 1]
                  )
                }
                else {
                  tx.executeSql(
                    'insert into ip(ID,value) values(?,?)', [1, IP]
                  )
                }
              }
            )
          }
        )
      }} />
    </SafeAreaView>
  )
}



export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={HomeScreen} />
        <Stack.Screen name="WebView" component={WebViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '50%'
  },
  webViewContainer: {
    // flex: 1,
    // backgroundColor: '#fff',
    alignItems: 'center',
    // ho: Constants.statusBarHeight,
    marginHorizontal: Constants.statusBarHeight,
  },
});
