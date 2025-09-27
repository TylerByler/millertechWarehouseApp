import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { Stack } from "expo-router";
import { openDatabaseAsync, SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { StrictMode, Suspense, useEffect } from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  const DATABASE_NAME = "data"

  const validateDB = async (): Promise<boolean> => {
    console.log("<===Validating Database Integrity===>")
    var db: SQLiteDatabase | undefined = undefined
    try {
      db = await openDatabaseAsync(DATABASE_NAME);
      console.log("SUCCESS: Database opened successfuly")
      console.log(db)
    } catch (e) {
      console.log("ERROR: Database failed to open")
      console.log(e)
      return false
    }

    if (db != undefined) {
      var error = undefined
      try {
        const result = await db.getFirstAsync<{journal_mode: string}>("PRAGMA journal_mode")
        console.log("Journal Mode: " + result?.journal_mode)
        const items = (await db.getAllAsync("SELECT * FROM items")).length
        const slots = (await db.getAllAsync("SELECT * FROM slots")).length
      } catch (e) {
        error = e;
      }

      if (error != undefined) {
        console.log("ERROR: SQL queries failed")
        console.log(error)
        return false;
      }

    } else {
      console.log("ERROR: Database is undefined")
      return false;
    }

    console.log("SUCCESS: Database has been validated")
    return true;
  }

  const createDBIfNeeded = async () => {
    const dbDir = `${FileSystem.documentDirectory}SQLite/`;
    const dbFile = `${dbDir}${DATABASE_NAME}`

    if (!(await FileSystem.getInfoAsync(dbDir)).exists) {
      await FileSystem.makeDirectoryAsync(dbDir, {intermediates: true});
    }

    if (!(await validateDB())) {
      try {
        await FileSystem.deleteAsync(dbFile)
      } catch (e) {
        console.log(e)
      }
      console.log("Copying Database")
      const asset = Asset.fromModule(require('../assets/data.db'))
      await asset.downloadAsync()
      console.log("Asset:")
      console.log(asset)
      try {
        await FileSystem.copyAsync({
          from: asset.localUri || asset.uri,
          to: dbFile
        });

        const newDbFileExists = await FileSystem.getInfoAsync(dbFile);
        if (!newDbFileExists.exists) {
          throw new Error('Database file was not copied correctly.');
        }
        console.log('Copied db size is ' + newDbFileExists.size + ' bytes')
        validateDB()
      } catch (e) {
        console.log(e)
      }
    }
  }

  useEffect(() => {
    createDBIfNeeded()
  }, [])

  const Loading = () => {
    return <View><Text>Loading...</Text></View>
  }
  
  return (
    <StrictMode>
      <Suspense fallback={Loading()}>
        <SQLiteProvider databaseName={DATABASE_NAME} useSuspense>
          <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="search" />
            <Stack.Screen name="slot/[id]/overview" />
            <Stack.Screen name="slot/[id]/quantityEdit" />
            <Stack.Screen name="item/[id]/overview" />
            <Stack.Screen name="item/[id]/descriptionEdit" />
            <Stack.Screen name="item/[id]/quantityEdit" />
          </Stack>
        </SQLiteProvider>
        </Suspense>
    </StrictMode>
  )
}