import { router, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

export default function addRemoveSlot() {
  const [slots, setSlots] = useState<string[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<string[]>([]);
  const [searchedValue, setSearchedValue] = useState<string>("");
  const [slotToDelete, setSlotToDelete] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const database = useSQLiteContext();

  const loadData = async () => {
		setSearchedValue("");
    try {
      const slotsResult = await database.getAllAsync<{ id: string }>(
        "SELECT id FROM slots ORDER BY id ASC;"
      );
      const parsedSlots = new Array<string>();
      for (let i = 0; i < slotsResult.length; i++) {
        parsedSlots.push(slotsResult[i].id);
      }

      setSlots(parsedSlots);
      setFilteredSlots(parsedSlots);
    } catch (e) {
      console.log(e);
      router.back();
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    searchSlots(searchedValue);
  }, [slots]);

  useEffect(() => {
    console.log(searchedValue);
    searchSlots(searchedValue);
  }, [searchedValue]);

  const searchSlots = (searchedValue: string) => {
    setSearchedValue(searchedValue);
    if (searchedValue.length === 0) {
      setFilteredSlots(slots);
      return;
    }
    const newSlotList = new Array<string>();
    for (let i = 0; i < slots.length; i++) {
      let isMatch = true;
      let offset = 0;
      for (
        let j = 0;
        j + offset < slots[i].length && j < searchedValue.length;
        j++
      ) {
        if (slots[i][j + offset] === "-" && searchedValue[j] !== "-") {
          offset++;
        }
        if (searchedValue[j].toUpperCase() !== slots[i][j + offset]) {
          isMatch = false;
        }
      }
      if (isMatch && !newSlotList.includes(slots[i])) {
        newSlotList.push(slots[i]);
      }
    }
    setFilteredSlots(newSlotList);
  };

  const startDelete = (item: string) => {
    setIsModalVisible(true);
    setSlotToDelete(item);
  };

  const submitNewSlotToDB = async () => {
    try {
      await database.runAsync(
        "INSERT INTO slots (id) VALUES ('" + searchedValue + "')"
      );
      loadData();
    } catch (e) {
      console.log(e);
    }
  };

  const removeSlotFromDB = async () => {
		// Remove from slot list
		// Remove all from quantities list
		try {
			await database.runAsync("DELETE FROM slots WHERE id='" + slotToDelete + "';")
			await database.runAsync("DELETE FROM quantities WHERE slot_id='" + slotToDelete + "';")
			loadData()
		} catch (e) {
			console.log(e)
		}
		closeModal()
	};

	const closeModal = () => {
		setIsModalVisible(false);
		setSlotToDelete("");
	}

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Edit Slots",
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerTintColor: "#fff",
        }}
      />
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarTitle}>
          <View style={styles.searchBarTitleTextContainer}>
            <Text style={styles.searchBarTitleText}>Add New Slot</Text>
          </View>
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Enter Slot ID..."
          placeholderTextColor={"grey"}
          onChangeText={(value) => {
            setSearchedValue(value);
          }}
          value={searchedValue}
        />
      </View>
      {filteredSlots.length > 0 && (
        <FlatList
          style={styles.list}
          data={filteredSlots}
          renderItem={({ item }) => (
            <Pressable
              style={styles.listItem}
              onPress={() => startDelete(item)}
            >
              <Text style={styles.listText}>{item}</Text>
            </Pressable>
          )}
        />
      )}
      {filteredSlots.length == 0 && (
        <Pressable
          style={styles.submitButton}
          onPress={() => submitNewSlotToDB()}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
            Submit
          </Text>
        </Pressable>
      )}
      <Modal animationType="none" transparent={true} visible={isModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.editModalBox}>
            <View style={styles.deleteMessageContainer}>
              <Text style={styles.deleteMessageText}>
                DO YOU WANT TO DELETE SLOT {slotToDelete}
              </Text>
							<Text>This will delete all quantities and relations between this item and it's slots</Text>
            </View>
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: "white", borderColor: "#25292e" },
                ]}
								onPress={() => closeModal()}
              >
                <Text style={[styles.deleteMessageText, { color: "#25292e" }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: "#db0202ff", borderColor: "#260000ff" },
                ]}
								onPress={() => removeSlotFromDB()}
              >
                <Text
                  style={[styles.deleteMessageText, { color: "#260000ff" }]}
                >
                  DELETE
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    width: "65%",
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  list: {
    width: "60%",
    flex: 2,
  },
  listItem: {
    display: "flex",
    width: "100%",
    height: 60,
    backgroundColor: "#cfd7e1",
    borderColor: "#25292e",
    borderWidth: 3,
    paddingHorizontal: 10,
    marginBottom: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  listText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchBarContainer: {
    width: "100%",
    flex: 0.3,
    flexDirection: "column",
    margin: 60,
  },
  searchBarTitle: {
    flex: 1,
    borderWidth: 4,
    borderColor: "#25292e",
    backgroundColor: "#25292e",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  searchBar: {
    flex: 1,
    borderWidth: 4,
    borderTopWidth: 0,
    borderColor: "#25292e",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 10,
  },
  searchBarTitleTextContainer: {
    alignSelf: "center",
    height: "100%",
    justifyContent: "center",
  },
  searchBarTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  submitButton: {
    width: 200,
    height: 80,
    backgroundColor: "#25292e",
    marginTop: 30,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000099",
  },
  editModalBox: {
    width: "50%",
    height: "40%",
    borderWidth: 4,
    borderColor: "#25292e",
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  deleteMessageContainer: {
    flex: 1,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteMessageText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    flex: 0.3,
    aspectRatio: 2,
    borderWidth: 4,
    borderRadius: 12,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
