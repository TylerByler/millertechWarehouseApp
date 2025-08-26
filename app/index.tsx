import SlabButton from "@/components/SlabButton";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
      options={{ 
        title: 'Millertech Warehouse', 
        headerStyle: {
        backgroundColor: '#25292e',
        },
        headerTintColor: '#fff',
      }}/>
      <View style={styles.buttonListContainer}>
        <SlabButton 
          style={styles.buttonContainer}
          href="/search"
          text="Search"
        />
        <SlabButton 
          style={styles.buttonContainer}
          href="/map"
          text="Map Screen"
        />
        <SlabButton 
          style={styles.buttonContainer}
          href="/addRemoveItem"
          text="Add New Item"
        />
        <SlabButton 
          style={styles.buttonContainer}
          href="/addRemoveSlot"
          text="Add New Slot"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center"
  },
  buttonListContainer: {
    display: "flex",
    alignSelf: "center",
    flexDirection: 'row',
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 800,
  },
  buttonContainer: {
    margin: 40,
  },
}) 