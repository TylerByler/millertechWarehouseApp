import { STATUS } from "@/assets/types/STATUS";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";



export default function ItemQuantityEdit() {
  const { id } = useLocalSearchParams();
  const [userQuantity, setUserQuantity] = useState<number>(0);
  const [userSlot, setUserSlot] = useState<string>("");
  const [isSlotSubmissionReady, setIsSlotSubmissionReady] = useState<boolean>(false)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [presentedData, setPresentedData] = useState<number[]>([]);
  const [importantSlots, setImportantSlots] = useState<number[]>([]);
  const [allSlots, setAllSlots] = useState<
    { slot_id: string; quantity: number; status: STATUS; isOg: boolean }[]
  >([]);
  const [ogSlots, setOgSlots] = useState<
    { slot_id: string; quantity: number; status: STATUS; isOg: boolean }[]
  >([]);

  const database = useSQLiteContext();


  /* EFFECTS */
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

	useEffect(() => {
		console.log("User Slot Changed")
		console.log(userSlot)
	}, [userSlot])

  useEffect(() => {
    if (userSlot === "" || userQuantity < 1) {
      setIsSlotSubmissionReady(false)
    } else {
      setIsSlotSubmissionReady(true)
    }
  }, [userSlot, userQuantity])


  /* DATA RETRIEVAL */
  const loadData = async () => {
    try {
      console.log("Loading Data");
      const slotResult = await database.getAllAsync<{ id: string }>(
        "SELECT id FROM slots ORDER BY SUBSTR(id, 1, 1), CAST(SUBSTR(id, 3) AS INTEGER);"
      );
      const quantityResult = await database.getAllAsync<{
        slot_id: string;
        quantity: number;
      }>(
        "SELECT slot_id, quantity FROM quantities WHERE item_id ='" + id + "';"
      );

      const newSlots = new Array<{
        slot_id: string;
        quantity: number;
        status: STATUS;
        isOg: boolean;
      }>();
      const newPresentedData = new Array<number>();

      for (let i = 0; i < slotResult.length; i++) {
        newSlots.push({
          slot_id: slotResult[i].id,
          status: STATUS.NORMAL,
          quantity: 0,
          isOg: false,
        });
        for (
          let j = 0;
          quantityResult !== null && j < quantityResult.length;
          j++
        ) {
          if (slotResult[i].id === quantityResult[j].slot_id) {
            newSlots[newSlots.length - 1].isOg = true;
            newSlots[newSlots.length - 1].quantity = quantityResult[j].quantity;
            newPresentedData.push(newSlots.length - 1);
          }
        }
      }

      setAllSlots([...newSlots]);
      setOgSlots([...newSlots]);
      setPresentedData([...newPresentedData]);
      setImportantSlots([...newPresentedData]);
    } catch (e) {
      console.log(e);
      router.back()
    }
  };

  const searchSlots = (searchedValue: string) => {
		if (searchedValue.length === 0) {
			setPresentedData(importantSlots)
			return
		}
		const newSlotList = new Array<number>()
		for (let i = 0; i < allSlots.length; i++) {
			let isMatch = true
			let offset = 0
			for(let j = 0; j < allSlots[i].slot_id.length && j < searchedValue.length; j++) {
				if (allSlots[i].slot_id[j + offset] === "-" && searchedValue[j] !== "-") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== allSlots[i].slot_id[j + offset]) {
					isMatch = false
				}
			}
			if (isMatch && !newSlotList.includes(i)) {
				newSlotList.push(i)
			}
		}
		setPresentedData([...newSlotList])
	}


  /* DATA PREPARATION */
	const updateSlot = (slot: string, quantity: number) => {
		let newSlot: {slot_id: string, quantity: number, status: STATUS, isOg: boolean}
		const slotIndex = allSlots.findIndex((e) => {return e.slot_id == slot})
		const previousQuantity = ogSlots[slotIndex].quantity

		newSlot = {
			slot_id: slot,
			quantity: quantity,
			status: STATUS.CHANGED,
			isOg: allSlots[slotIndex].isOg,
		}

		if (quantity <= 0) {
			newSlot = {
				slot_id: slot,
				quantity: 0,
				status: STATUS.DELETED,
				isOg: allSlots[slotIndex].isOg
			}
		}
		if (quantity === previousQuantity) {
			newSlot = {
				slot_id: slot,
				quantity: quantity,
				status: STATUS.NORMAL,
				isOg: allSlots[slotIndex].isOg
			}
		}

		if (!newSlot.isOg) {
			if (newSlot.status !== STATUS.NORMAL) {
				importantSlots.push(slotIndex)
				importantSlots.sort()
			} else {
				const valueIndex = importantSlots.findIndex((e) => e === slotIndex)
				const tmpA = importantSlots[valueIndex]
				const tmpB = importantSlots[importantSlots.length-1]

				importantSlots[valueIndex] = tmpB
				importantSlots[importantSlots.length-1] = tmpA

				importantSlots.pop()
			}
		}

		allSlots[slotIndex] = newSlot
		setPresentedData([...importantSlots])
	}

  const clearAll = async () => {
		let removeStatement = ""

    for (let i = 0; i < ogSlots.length; i++) {
      if (removeStatement !== "") {
        removeStatement += ", "
      }
      removeStatement += ("'" + ogSlots[i].slot_id + "'")
    }

    try {
			await database.runAsync("DELETE FROM quantities WHERE item_id = '" + id + "' AND slot_id IN (" + removeStatement + ");")
		} catch (e) {
			console.log(e)
      router.back()
		}

    router.back()
	}

  const submitToDB = async () => {
		// USE allSlots AND ogSlots to make database calls change values
    const finalSlots = allSlots.filter(e => e.quantity !== 0 || e.isOg)
		// One Item, Many Slots
		// Update quantity table
		const result = await database.getAllAsync<{slot_id: string, quantity: number}>("SELECT * FROM quantities WHERE item_id = '" + id + "';")

		let removeStatement = ""

		for (let i = 0; i < finalSlots.length; i++) {
			if (finalSlots[i].quantity === 0) {
				if (removeStatement !== "") {
					removeStatement += ", "
				}
				removeStatement += ("'" + finalSlots[i].slot_id + "'")
				let temp = finalSlots[i]
				finalSlots[i] = finalSlots[finalSlots.length-1]
				finalSlots[finalSlots.length-1] = temp
				finalSlots.pop()
			}
		}

		try {
			await database.runAsync("DELETE FROM quantities WHERE item_id = '" + id + "' AND slot_id IN (" + removeStatement + ");")
		} catch (e) {
			console.log(e)
		}

		try {
			for (let i = 0; i < finalSlots.length; i++) {
				let resultIndex = result.findIndex((e) => (e.slot_id == finalSlots[i].slot_id))
				if (resultIndex !== -1 && result[resultIndex].quantity !== finalSlots[i].quantity) {
					await database.runAsync("UPDATE quantities SET quantity = " + finalSlots[i].quantity + " WHERE item_id = '" + id + "' AND slot_id = '" + finalSlots[i].slot_id + "';")
				}
				if (resultIndex == -1) {
					await database.runAsync("INSERT INTO quantities (item_id, slot_id, quantity) VALUES ('" + id + "', '" + finalSlots[i].slot_id + "', " + finalSlots[i].quantity.toString() + ");")
				}
			}
		} catch (e) {
			console.log(e)
		}
		router.back()
	}


  /* ACTIONS */
  const onPressChangeValue = () => {
    updateSlot(userSlot, userQuantity)
    setUserQuantity(0)
    setUserSlot("")
  }

  const onPressClearSlots = () => {
    setIsModalVisible(true)
  }

	const onPressCancel = () => {
		router.back()
	}

  const onPressSubmit = () => {
    submitToDB()
  }

  const onPressClear = (item: number) => {
    updateSlot(allSlots[item].slot_id, 0)
  }

  const onPressReset = (item: number) => {
    updateSlot(allSlots[item].slot_id, ogSlots[item].quantity)
  }

  const closeModal = () => {
    setIsModalVisible(false)
  }

  const onSelectElement = (item: number) => {
    setUserSlot(allSlots[item].slot_id)
  }


  /* COMPONENTS */
  const flatListElement = ({ item }: { item: number }) => {
    return (
      <Pressable
        style={[
          styles.listElement,
          allSlots[item].status === STATUS.NORMAL &&
            !allSlots[item].isOg && { backgroundColor: "#cfd7e1" },
          allSlots[item].status === STATUS.NORMAL &&
            allSlots[item].isOg && { backgroundColor: "#8fffa9" },
          allSlots[item].status === STATUS.CHANGED && {
            backgroundColor: "#ffebaf",
          },
          allSlots[item].status === STATUS.DELETED && {
            backgroundColor: "#ffc4c4",
          },
        ]}
        onPress={() => onSelectElement(item)}
      >
        <View style={[styles.listElementComponent, { flex: 3 }]}>
          <View style={[
            styles.slotNameContainer,
            userSlot==allSlots[item].slot_id && {borderWidth: 4, borderColor: "green", borderRadius: 12,}
            ]}>
            <Text>{allSlots[item].slot_id}</Text>
          </View>
        </View>
				<View style={[styles.listElementComponent, { flex: 3 }]}>
					<Text>{allSlots[item].quantity}</Text>
				</View>
        <View style={[styles.listElementComponent, {flex: 2}]}>
          {allSlots[item].status === STATUS.CHANGED && <Pressable
            style={[
              styles.button,
              { flex: 0, borderWidth: 2, height: "70%", width: "80%" },
            ]}
            onPress={() => onPressReset(item)}
          >
            <Text>Reset</Text>
          </Pressable>}
        </View>
        <View style={[styles.listElementComponent, {flex: 2}]}>
          <Pressable
            style={[
              styles.button,
              { flex: 0, borderWidth: 2, height: "70%", width: "80%" },
            ]}
            onPress={() => onPressClear(item)}
          >
            <Text>Clear</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  if (!database) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View style={styles.pageContainer}>
      <Stack.Screen
        options={{
          title: "Item Quantites Edit",
          headerStyle: {
            backgroundColor: "#25292e",
          },
          headerTintColor: "#fff",
        }}
      />
      <View
        style={[
          styles.pageRow,
          { flex: 1, backgroundColor: "#25292e", borderRadius: 30 },
        ]}
      >
        <View style={[styles.topBarLabel, { flex: 2 }]}>
          <Text style={styles.topBarLabelText}>QUANTITY</Text>
        </View>
        <View style={[styles.topBarLabel, { flex: 4 }]}>
          <Text style={styles.topBarLabelText}>SLOT</Text>
        </View>
        <View
          style={[styles.topBarLabel, { flex: 3, marginRight: 0, padding: 0 }]}
        >
          <Text style={styles.topBarLabelText}>SUBMIT</Text>
        </View>
      </View>
      <View style={[styles.pageRow, { flex: 2 }]}>
        <View style={[styles.inputBox, { flex: 2 }]}>
          <TextInput 
          style={styles.input} 
          placeholder="Enter Quantity..." 
          onChangeText={(value) => {
            if(value !== "") {
              setUserQuantity(parseInt(value));
            } else (setUserQuantity(0))
          }} 
          inputMode="numeric"
          value={userQuantity.toString()}/>
        </View>
        <View style={[styles.inputBox, { flex: 4 }]}>
          <TextInput style={styles.input} placeholder="Enter Slot..." onChangeText={(value) => {searchSlots(value); setUserSlot("");}} />
        </View>
        {!isSlotSubmissionReady && 
        <View style={[styles.button, {flex: 3, backgroundColor: "#cacacaff"}]}>
          <Text style={[styles.buttonText, {color: "#8a8a8aff"}]}>Change Value</Text>
        </View>
        }
        {isSlotSubmissionReady && 
        <Pressable
          style={[styles.button, { flex: 3, backgroundColor: "#25292e" }]}
					onPress={onPressChangeValue}
        >
          <Text style={styles.buttonText}>Change Value</Text>
        </Pressable>}
      </View>
      <View style={[styles.pageRow, { flex: 12 }]}>
        <FlatList
          style={styles.listContainer}
          data={presentedData}
          renderItem={flatListElement}
          keyExtractor={(i) => allSlots[i].slot_id}
        />
      </View>
      <View style={[styles.pageRow, { flex: 2 }]}>
        <Pressable
          style={[
            styles.button,
            styles.rightMargin,
            {
              backgroundColor: "#ff2525ff",
              borderWidth: 4,
              borderColor: "#360000",
            },
          ]}
					onPress={onPressClearSlots}
        >
          <Text style={[styles.buttonText, { color: "#360000" }]}>
            Clear Slot
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            styles.rightMargin,
            {
              backgroundColor: "#a2a2a2ff",
              borderWidth: 4,
              borderColor: "#333333",
            },
          ]}
					onPress={onPressCancel}
        >
          <Text style={[styles.buttonText, { color: "#333333" }]}>Cancel</Text>
        </Pressable>
        <Pressable 
					style={[
						styles.button, 
						{ 
							backgroundColor: "#25292e" 
						},
					]} 
					onPress={onPressSubmit}
				>
          <Text style={[styles.buttonText]}>Submit</Text>
        </Pressable>
      </View>
      <Modal animationType="none" transparent={true} visible={isModalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.editModalBox}>
            <View style={styles.deleteMessageContainer}>
              <Text style={styles.deleteMessageText}>
                DO YOU WANT TO CLEAR ALL SLOTS???
              </Text>
              <Text style={{textAlign: "center", marginTop: 10}}>
                This will delete all quantities and relations between this slot and it's items
              </Text>
            </View>
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: "white", borderColor: "#25292e", borderWidth: 4, marginVertical: 30, marginHorizontal: 20},
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
                  { backgroundColor: "#db0202ff", borderColor: "#260000ff", borderWidth: 4, marginVertical: 30, marginHorizontal: 20 },
                ]}
                onPress={clearAll}
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
  pageContainer: {
    flex: 1,
    width: "80%",
    marginTop: 80,
    marginBottom: 80,
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  pageRow: {
    width: "100%",
    marginBottom: 20,
    flexDirection: "row",
  },
  inputBox: {
    borderWidth: 4,
    borderColor: "#25292e",
    borderRadius: 30,
    marginRight: 20,
    padding: 10,
  },
  button: {
    flex: 1,
    borderRadius: 30,
    textAlign: "center",
    textAlignVertical: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  input: {
    flex: 1,
  },
  topBarLabel: {
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 20,
    padding: 10,
    borderRadius: 30,
  },
  topBarLabelText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  rightMargin: {
    marginRight: 20,
  },
  listContainer: {
    flex: 1,
    borderWidth: 4,
    borderColor: "#25292e",
    borderRadius: 30,
  },
  listElement: {
    flex: 1,
    borderBottomWidth: 2,
    flexDirection: "row",
    borderTopWidth: 0,
    borderColor: "#25292e",
    height: 60,
  },
  listElementComponent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    textAlignVertical: "center",
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
    justifyContent: "center"
	},
	deleteMessageText: {
		fontSize: 20,
		fontWeight: "bold",
    textAlign: "center"
	},
	buttonsContainer: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-around",
	},
  slotNameContainer: {
    padding: 5,
  }
});
