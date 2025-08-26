import { Stack } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';
import { StrictMode, Suspense, useEffect } from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  const lockScreenOrientation = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }

  useEffect(() => {
    lockScreenOrientation();
  },[])

  const createDBIfNeeded = async (db: SQLiteDatabase) => {
    console.log("Creating Database")
    try {
      await db.execAsync(
        `
        DROP TABLE IF EXISTS slots;
        DROP TABLE IF EXISTS items;
        DROP TABLE IF EXISTS quantities;

        CREATE TABLE IF NOT EXISTS slots (
          id VARCHAR(10) NOT NULL PRIMARY KEY);

        CREATE TABLE IF NOT EXISTS items (
          id VARCHAR(20) NOT NULL PRIMARY KEY);

        CREATE TABLE IF NOT EXISTS quantities (
          item_id VARCHAR(20) NOT NULL,
          slot_id VARCAHR(10) NOT NULL,
          quantity INTEGER,
          FOREIGN KEY(item_id) REFERENCES items(id),
          FOREIGN KEY(slot_id) REFERENCES slots(id));

        INSERT INTO slots (id) VALUES ('A-1');
        INSERT INTO slots (id) VALUES ('A-2');
        INSERT INTO slots (id) VALUES ('A-3');

        INSERT INTO items (id) VALUES ('JS40P');
        INSERT INTO items (id) VALUES ('JS22PK');
        INSERT INTO items (id) VALUES ('HD1GW');

        INSERT INTO quantities (item_id, slot_id, quantity) VALUES ('JS40P', 'A-1', 40);
        `
      );
    } catch(e) {
      console.log(e);
    }
  }

  const Loading = () => {
    return <View><Text>Fart</Text></View>
  }
  
  return (
    <StrictMode>
      <Suspense fallback={Loading()}>
        <SQLiteProvider databaseName="millertechWarehouseSqlite" onInit={createDBIfNeeded} useSuspense>
          <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen name="map" />
            <Stack.Screen name="search" />
            <Stack.Screen name="slot/[id]" />
            <Stack.Screen name="item/[id]" />
          </Stack>
        </SQLiteProvider>
        </Suspense>
    </StrictMode>
  )
}