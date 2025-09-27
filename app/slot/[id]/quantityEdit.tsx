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

export default function SlotQuantityEdit() {
	const { id } = useLocalSearchParams();
	const [userQuantity, setUserQuantity] = useState<number>(0);
	const [userItem, setUserItem] = useState<string>("");
	const [isItemSubmissionReady, setIsItemSubmissionReady] = useState<boolean>(false)
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
	const [presentedData, setPresentedData] = useState<number[]>([]);
	const [importantItems, setImportantItems] = useState<number[]>([]);
	const [allItems, setAllItems] = useState<
		{ item_id: string; quantity: number; status: STATUS; isOg: boolean }[]
	>([]);
	const [ogItems, setOgItems] = useState<
		{ item_id: string; quantity: number; status: STATUS; isOg: boolean }[]
	>([]);

	const database = useSQLiteContext();


	/* EFFECTS */
	useFocusEffect(
		useCallback(() => {
			if (database) {
				loadData();
			}
		}, [database])
	);

	useEffect(() => {
		console.log("User Item Changed")
		console.log(userItem)
	}, [userItem])

	useEffect(() => {
		if (userItem === "" || userQuantity < 1) {
			setIsItemSubmissionReady(false)
		} else {
			setIsItemSubmissionReady(true)
		}
	}, [userItem, userQuantity])


	/* DATA RETRIEVAL */
	const loadData = async () => {
		try {
			console.log("Loading Data");
			const itemResult = await database.getAllAsync<{ id: string }>(
				"SELECT id FROM items ORDER BY id DESC;"
			);
			const quantityResult = await database.getAllAsync<{
				item_id: string;
				quantity: number;
			}>(
				"SELECT item_id, quantity FROM quantities WHERE slot_id ='" + id + "';"
			);

			const newItems = new Array<{
				item_id: string;
				quantity: number;
				status: STATUS;
				isOg: boolean;
			}>();
			const newPresentedData = new Array<number>();

			for (let i = 0; i < itemResult.length; i++) {
				newItems.push({
					item_id: itemResult[i].id,
					status: STATUS.NORMAL,
					quantity: 0,
					isOg: false,
				});
				for (
					let j = 0;
					quantityResult !== null && j < quantityResult.length;
					j++
				) {
					if (itemResult[i].id === quantityResult[j].item_id) {
						newItems[newItems.length - 1].isOg = true;
						newItems[newItems.length - 1].quantity = quantityResult[j].quantity;
						newPresentedData.push(newItems.length - 1);
					}
				}
			}

			setAllItems([...newItems]);
			setOgItems([...newItems]);
			setPresentedData([...newPresentedData]);
			setImportantItems([...newPresentedData]);
		} catch (e) {
			console.log(e);
		}
	};

	const searchItems = (searchedValue: string) => {
		if (searchedValue.length === 0) {
			setPresentedData(importantItems)
			return
		}
		const newItemList = new Array<number>()
		for (let i = 0; i < allItems.length; i++) {
			let isMatch = true
			let offset = 0
			for(let j = 0; j < allItems[i].item_id.length && j < searchedValue.length; j++) {
				if (searchedValue[j].toUpperCase() !== allItems[i].item_id[j + offset]) {
					isMatch = false
				}
				if (allItems[i].item_id[j + offset] === "-" && searchedValue[j] !== "-") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== allItems[i].item_id[j + offset]) {
					isMatch = false
				}
			}
			if (isMatch && !newItemList.includes(i)) {
				newItemList.push(i)
			}
		}
		setPresentedData([...newItemList])
	}


	/* DATA PREPARATION */
	const updateItem = (item: string, quantity: number) => {
		let newItem: {item_id: string, quantity: number, status: STATUS, isOg: boolean}
		const itemIndex = allItems.findIndex((e) => {return e.item_id == item})
		const previousQuantity = ogItems[itemIndex].quantity

		newItem = {
			item_id: item,
			quantity: quantity,
			status: STATUS.CHANGED,
			isOg: allItems[itemIndex].isOg,
		}

		if (quantity <= 0) {
			newItem = {
				item_id: item,
				quantity: 0,
				status: STATUS.DELETED,
				isOg: allItems[itemIndex].isOg
			}
		}
		if (quantity === previousQuantity) {
			newItem = {
				item_id: item,
				quantity: quantity,
				status: STATUS.NORMAL,
				isOg: allItems[itemIndex].isOg
			}
		}

		if (!newItem.isOg) {
			if (newItem.status !== STATUS.NORMAL) {
				importantItems.push(itemIndex)
				importantItems.sort()
			} else {
				const valueIndex = importantItems.findIndex((e) => e === itemIndex)
				const tmpA = importantItems[valueIndex]
				const tmpB = importantItems[importantItems.length-1]

				importantItems[valueIndex] = tmpB
				importantItems[importantItems.length-1] = tmpA

				importantItems.pop()
			}
		}

		allItems[itemIndex] = newItem
		setPresentedData([...importantItems])
	}

	/* DATA MANIPULATION */
	const clearAll = async () => {
		let removeStatement = ""

		for (let i = 0; i < ogItems.length; i++) {
			if (removeStatement !== "") {
				removeStatement += ", "
			}
			removeStatement += ("'" + ogItems[i].item_id + "'")
		}

		try {
			await database.runAsync("DELETE FROM quantities WHERE slot_id = '" + id + "' AND item_id IN (" + removeStatement + ");")
		} catch (e) {
			console.log(e)
			router.back()
		}

		router.back()
	}

	const submitToDB = async () => {
		const finalItems = allItems.filter(e => e.quantity !== 0 || e.isOg)
		const result = await database.getAllAsync<{item_id: string, quantity: number}>("SELECT * FROM quantities WHERE slot_id = '" + id + "';")

		let removeStatement = ""

		for (let i = 0; i < finalItems.length; i++) {
			if (finalItems[i].quantity === 0) {
				if (removeStatement !== "") {
					removeStatement += ", "
				}
				removeStatement += ("'" + finalItems[i].item_id + "'")
				let temp = finalItems[i]
				finalItems[i] = finalItems[finalItems.length-1]
				finalItems[finalItems.length-1] = temp
				finalItems.pop()
			}
		}

		try {
			await database.runAsync("DELETE FROM quantities WHERE slot_id = '" + id + "' AND item_id IN (" + removeStatement + ");")
		} catch (e) {
			console.log(e)
		}

		try {
			for (let i = 0; i < finalItems.length; i++) {
				let resultIndex = result.findIndex((e) => (e.item_id == finalItems[i].item_id))
				if (resultIndex !== -1 && result[resultIndex].quantity !== finalItems[i].quantity) {
					await database.runAsync("UPDATE quantities SET quantity = " + finalItems[i].quantity + " WHERE slot_id = '" + id + "' AND item_id = '" + finalItems[i].item_id + "';")
				}
				if (resultIndex == -1) {
					await database.runAsync("INSERT INTO quantities (slot_id, item_id, quantity) VALUES ('" + id + "', '" + finalItems[i].item_id + "', " + finalItems[i].quantity.toString() + ");")
				}
			}
		} catch (e) {
			console.log(e)
		}
		router.back()
	}


	/* ACTIONS */
	const onPressChangeValue = () => {
		updateItem(userItem, userQuantity)
		setUserQuantity(0)
		setUserItem("")
	}

	const onPressClearItems = () => {
		setIsModalVisible(true)
	}

	const onPressCancel = () => {
		router.back()
	}

	const onPressSubmit = () => {
		submitToDB()
	}

	const onPressClear = (item: number) => {
		updateItem(allItems[item].item_id, 0)
	}

	const onPressReset = (item: number) => {
		updateItem(allItems[item].item_id, ogItems[item].quantity)
	}

	const closeModal = () => {
		setIsModalVisible(false)
	}

	const onSelectElement = (item: number) => {
		setUserItem(allItems[item].item_id)
	}

	const closePage = () => {
		
	}


	/* COMPONENTS */
	const flatListElement = ({ item }: { item: number }) => {
		return (
			<Pressable
				style={[
					styles.listElement,
					allItems[item].status === STATUS.NORMAL &&
						!allItems[item].isOg && { backgroundColor: "#cfd7e1" },
					allItems[item].status === STATUS.NORMAL &&
						allItems[item].isOg && { backgroundColor: "#8fffa9" },
					allItems[item].status === STATUS.CHANGED && {
						backgroundColor: "#ffebaf",
					},
					allItems[item].status === STATUS.DELETED && {
						backgroundColor: "#ffc4c4",
					},
				]}
				onPress={() => onSelectElement(item)}
			>
				<View style={[styles.listElementComponent, { flex: 3 }]}>
					<View style={[
						styles.slotNameContainer,
						userItem==allItems[item].item_id && {borderWidth: 4, borderColor: "green", borderRadius: 12,}
						]}>
						<Text>{allItems[item].item_id}</Text>
					</View>
				</View>
				<View style={[styles.listElementComponent, { flex: 3 }]}>
					<Text>{allItems[item].quantity}</Text>
				</View>
				<View style={[styles.listElementComponent, {flex: 2}]}>
					{allItems[item].status === STATUS.CHANGED && <Pressable
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
					title: "Slot Quantites Edit",
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
					<Text style={styles.topBarLabelText}>ITEM</Text>
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
					<TextInput style={styles.input} placeholder="Enter Item..." onChangeText={(value) => {searchItems(value); setUserItem("");}} />
				</View>
				{!isItemSubmissionReady && 
				<View style={[styles.button, {flex: 3, backgroundColor: "#cacacaff"}]}>
					<Text style={[styles.buttonText, {color: "#8a8a8aff"}]}>Change Value</Text>
				</View>
				}
				{isItemSubmissionReady && 
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
					keyExtractor={(i) => allItems[i].item_id}
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
					onPress={onPressClearItems}
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
								DO YOU WANT TO CLEAR ALL ITEMS???
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
