import { Stack } from "expo-router";
import * as SQLite from 'expo-sqlite';
import { StrictMode } from "react";


export default function RootLayout() {
  const createDbIfNeeded = async (db: SQLite.SQLiteDatabase) => {
    console.log("Creating Database")
    try {
      await db.execAsync(
        `
        CREATE TABLE IF NOT EXISTS slots (
          id VARCHAR(10) NOT NULL PRIMARY KEY);

        CREATE TABLE IF NOT EXISTS items (
          id VARCHAR(20) NOT NULL PRIMARY KEY,
          name VARCHAR(40) NOT NULL,
          primaryslot VARCHAR(10) NOT NULL,
          desc TEXT NOT NULL);

        CREATE TABLE IF NOT EXISTS quantities (
          item_id VARCHAR(20) NOT NULL,
          slot_id VARCAHR(10) NOT NULL,
          quantity INTEGER NOT NULL,
          FOREIGN KEY(item_id) REFERENCES items(id),
          FOREIGN KEY(slot_id) REFERENCES slots(id));
          `

      );
    } catch(e) {
      console.log(e);
    }
  }

  return (
    <StrictMode>
      <SQLite.SQLiteProvider databaseName="millertechWarehouseSqlite" onInit={createDbIfNeeded}>
        <Stack>
          <Stack.Screen name="index" options={{ 
            title: 'Millertech Warehouse', 
            headerStyle: {
            backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            }} />
          <Stack.Screen name="map" options={{ 
            title: 'Map',
            headerStyle: {
            backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            }} />
            <Stack.Screen name="search" options={{ 
            title: 'Search',
            headerStyle: {
            backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            }} />
          <Stack.Screen name="slot/[id]" options={{ 
            title: 'Slot Detail Screen',
            headerStyle: {
            backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            }} />
          <Stack.Screen name="item/[id]" options={{ 
            title: 'Item Detail Screen',
            headerStyle: {
            backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            }} />
        </Stack>
      </SQLite.SQLiteProvider>
    </StrictMode>
  )
}