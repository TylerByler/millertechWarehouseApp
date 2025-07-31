import { Stack } from "expo-router";
import * as SQLite from 'expo-sqlite';


export default function RootLayout() {
  const createDbIfNeeded = async (db: SQLite.SQLiteDatabase) => {
    console.log("Creating Database")
    try {
      await db.execAsync(
        `DROP TABLE slots;
        DROP TABLE items;
        CREATE TABLE IF NOT EXISTS slots (
          id VARCHAR(10) NOT NULL PRIMARY KEY, 
          items JSON NOT NULL, 
          posx INTEGER NOT NULL, 
          posy INTEGER NOT NULL, 
          posz INTEGER NOT NULL); 
          
        INSERT INTO slots (id, items, posx, posy, posz) VALUES ('A-1',json_array('HD1GW', 'JS22PK'), 0, 0, 0); 
        INSERT INTO slots (id, items, posx, posy, posz) VALUES ('A-2',json_array('HD1GW'), 0, 0, 0);
        INSERT INTO slots (id, items, posx, posy, posz) VALUES ('A-3',json_array('HD1GW', 'JS22PK'), 0, 0, 0);

        
        CREATE TABLE IF NOT EXISTS items (
          id VARCHAR(20) NOT NULL PRIMARY KEY,
          name VARCHAR(40) NOT NULL,
          primaryslot VARCHAR(10) NOT NULL,
          slots JSON NOT NULL,
          desc TEXT);
        
        INSERT INTO items (id, name, primaryslot, slots, desc) VALUES ('JS40P','40oz Swahn Water Bottle', 'A-3', json_array(), 'ENTER DESC HERE');
        INSERT INTO items (id, name, primaryslot, slots, desc) VALUES ('HD1GW','Heavy Duty 1 Gallon Jug White', 'A-1', json_array(json_object('id', 'A-1', 'quantity', 10), json_object('id', 'A-2', 'quantity', 20), json_object('id', 'A-3', 'quantity', 10)), 'ENTER DESC HERE');
        INSERT INTO items (id, name, primaryslot, slots, desc) VALUES ('JS22PK','22oz Swahn Water Bottle', 'A-2', json_array(json_object('id', 'A-1', 'quantity', 5), json_object('id', 'A-3', 'quantity', 30)), 'ENTER DESC HERE');
        `
      );
    } catch(e) {
      console.log(e);
    }
  }

  return (
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
  )
}