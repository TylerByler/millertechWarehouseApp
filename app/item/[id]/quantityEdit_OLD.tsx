import { Item } from "@/assets/types/Item";
import { STATUS } from "@/assets/types/STATUS";
import SlotEditMenu from "@/components/slotEdit/slotEditMenu";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ItemQuantityEdit() {
	const {id} = useLocalSearchParams()
	const [editSlot, setEditSlot] = useState<number>(-1)
	const [isModalVisible, setIsModalVisible] = useState<boolean>()
	const [presentedData, setPresentedData] = useState<number[]>([])
	const [importantSlots, setImportantSlots] = useState<number[]>([])
	const [slots, setSlots] = useState<{slot_id: string, quantity: number, status: STATUS, isOgSlot: boolean}[]>([])
	const [ogSlots, setOgSlots] = useState<{slot_id: string, quantity: number, status: STATUS, isOgSlot: boolean}[]>([])
	const [item, setItem] = useState<Item>({
		id: "",
		name: "",
		primarySlot: "",
		slots: [],
		description: "",
	})

	const database = useSQLiteContext() 

	const loadData = async () => {
		const result = await database.getAllAsync<{id: string}>("SELECT id FROM slots ORDER BY SUBSTR(id, 1, 1), CAST(SUBSTR(id, 3) AS INTEGER);")
		const quantityResult = await database.getAllAsync<{slot_id: string, quantity: number}>("SELECT slot_id, quantity FROM quantities WHERE item_id ='" + id + "';")
		const newSlots = new Array<{slot_id: string, quantity: number, status: STATUS, isOgSlot: boolean}>()
		const newPresentedData = new Array<number>()
		let newItem: Item;

		if (typeof id === "string") {
			newItem = {
				id: id,
				name: "",
				primarySlot: "",
				slots: quantityResult,
				description: "",
			}
		} else {
			newItem = {
				id: id[0],
				name: "",
				primarySlot: "",
				slots: quantityResult,
				description: "",
			}
		}

		console.log("NewItem")
		console.log(newItem)
		setItem(newItem)

		for (let i = 0; i < result.length; i++) {
			newSlots.push({
				slot_id: result[i].id,
				status: STATUS.NORMAL,
				quantity: 0,
				isOgSlot: false
			})
			for (let j = 0; newItem.slots !== null && j < newItem.slots.length; j++) {
				if (result[i].id === newItem.slots[j].slot_id) {
					newSlots[newSlots.length-1].isOgSlot = true
					newSlots[newSlots.length-1].quantity = newItem.slots[j].quantity
					newPresentedData.push(newSlots.length-1)
				}
			}
		}

		setSlots(newSlots)
		setOgSlots([...newSlots])
		setPresentedData(newPresentedData)
		setImportantSlots([...newPresentedData])
	}

	useEffect(() => {
		loadData()
	},[])

	useEffect(() => {
		if (editSlot < 0) {
			setIsModalVisible(false)
		} else {
			setIsModalVisible(true)
		}
	}, [editSlot])

	const searchSlots = (searchedValue: string) => {
		if (searchedValue.length === 0) {
			setPresentedData(importantSlots)
			return
		}
		const newSlotList = new Array<number>()
		for (let i = 0; i < slots.length; i++) {
			let isMatch = true
			let offset = 0
			for(let j = 0; j < slots[i].slot_id.length && j < searchedValue.length; j++) {
				if (slots[i].slot_id[j + offset] === "-" && searchedValue[j] !== "-") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== slots[i].slot_id[j + offset]) {
					isMatch = false
				}
			}
			if (isMatch && !newSlotList.includes(i)) {
				newSlotList.push(i)
			}
		}
		setPresentedData(newSlotList)
	}

	const onPressSlot = (id: number) => {
		setEditSlot(id)
	}

	const onCloseEditSlot = () => {
		setEditSlot(-1)
	}

	const onReset = (index: number) => {
		onSubmitSlotEdit(index,ogSlots[index].quantity)
	}

	const onSubmitSlotEdit = (slotIndex: number, updatedSlotQuantity: number) => {
		let newSlot: {slot_id: string, quantity: number, status: STATUS, isOgSlot: boolean}
		const newSlotId = slots.findIndex(e => e.slot_id === slots[slotIndex].slot_id)
		const previousQuantity = ogSlots[newSlotId].quantity

		newSlot = {
			slot_id: slots[slotIndex].slot_id,
			quantity: updatedSlotQuantity,
			status: STATUS.CHANGED,
			isOgSlot: slots[slotIndex].isOgSlot
		}

		if (updatedSlotQuantity <= 0) {
			newSlot = {
				slot_id: slots[slotIndex].slot_id,
				quantity: 0,
				status: STATUS.DELETED,
				isOgSlot: slots[slotIndex].isOgSlot
			}
		}
		if (updatedSlotQuantity === previousQuantity) {
			newSlot = {
				slot_id: slots[slotIndex].slot_id,
				quantity: updatedSlotQuantity,
				status: STATUS.NORMAL,
				isOgSlot: slots[slotIndex].isOgSlot
			}
		}
		const indexOfSlot = slots.findIndex(e => e.slot_id === newSlot.slot_id)

		if (!newSlot.isOgSlot) {
			if (newSlot.status !== STATUS.NORMAL) {
				importantSlots.push(indexOfSlot)
				importantSlots.sort()
			} else {
				const valueIndex = importantSlots.findIndex((e) => e === indexOfSlot)
				const tmpA = importantSlots[valueIndex]
				const tmpB = importantSlots[importantSlots.length - 1]

				importantSlots[valueIndex] = tmpB
				importantSlots[importantSlots.length - 1] = tmpA

				importantSlots.pop()
			}
		}

		slots[slots.findIndex(e => e.slot_id === newSlot.slot_id)] = newSlot
		setPresentedData([...importantSlots])
	}

	const onSubmitDataToDB = async () => {
		const finalSlots = slots.filter(e => e.quantity !== 0 || e.isOgSlot)
		// One Item, Many Slots
		// Update quantity table
		const result = await database.getAllAsync<{slot_id: string, item_id: string, quantity: number}>("SELECT * FROM quantities WHERE item_id = '" + id + "';")

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

	const Slots = ({item}: {item: number}) => (
		<Pressable
		style={[
			styles.listItem,
			slots[item].status === STATUS.NORMAL && !slots[item].isOgSlot && {backgroundColor: '#cfd7e1'},
			slots[item].status === STATUS.NORMAL && slots[item].isOgSlot && {backgroundColor: '#8fffa9'},
			slots[item].status === STATUS.CHANGED && {backgroundColor: '#ffebaf'},
			slots[item].status === STATUS.DELETED && {backgroundColor: '#ffc4c4'},
			]}
		onPress={() => onPressSlot(item)}
		>
			<View style={styles.listLabel}>
				<Text>
					{slots[item].slot_id} 
				</Text>
			</View>
			<View style={styles.listLabel}>
				<Text>
				{slots[item].quantity}
				</Text>
			</View>
			<View style={styles.listLabel}>
				<Pressable style={styles.resetButton} onPress={() => onReset(item)}>
					<Text>Reset</Text>
				</Pressable>
			</View>
		</Pressable>
	)

	return (
		<View style={styles.container}>
			<Stack.Screen 
			options={{ 
				title: 'Item Quantites Edit',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
			<View style={styles.searchBarContainer}>
				<View style={styles.searchBarTitle}>
					<View style={styles.searchBarTitleTextContainer}>
						<Text style={styles.searchBarTitleText}>Editing Slots of Item #{id}</Text>
					</View>
				</View>
				<TextInput 
				style={styles.searchBar}
				placeholder="Enter Slot ID..."
				placeholderTextColor={"grey"}
				onChangeText={(value) => {
					searchSlots(value)
				}}
				/>
			</View>
			<View style={styles.listContainer}>
				<View style={styles.listLabelContainer}>
					<View style={styles.listLabel}>
						<Text style={styles.listLabelText}>Slot</Text>
					</View>
					<View style={styles.listLabel}>
						<Text style={styles.listLabelText}>Quantity</Text>
					</View>
					<View style={styles.listLabel}>
						<Text style={styles.listLabelText}>Reset Button</Text>
					</View>
				</View>
				<FlatList
				data={presentedData}
				renderItem={Slots}
				keyExtractor={(i) => slots[i].slot_id}
				/>
			</View>
			<View style={{width: "100%", justifyContent: "center", alignItems: "center"}}>
				<Pressable style={styles.submitButton} onPress={() => onSubmitDataToDB()}>
					<Text style={{fontSize: 20, fontWeight: "bold", color: "#fff"}}>
						Submit
					</Text>
				</Pressable>
			</View>
			<Modal animationType="none" transparent={true} visible={isModalVisible}>
				<SlotEditMenu 
				slotIndex={editSlot}
				slot={slots[editSlot]}
				ogQuantity={ogSlots[editSlot] !== undefined ? ogSlots[editSlot].quantity : 0}
				onCloseEditSlot={onCloseEditSlot}
				onSubmit={onSubmitSlotEdit}
				></SlotEditMenu>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		width: "80%",
		marginTop: 80,
		flexDirection: "column",
		alignContent: "center",
		flex: 1,
	},
	searchBarContainer: {
		width: "100%",
		height: 120,
		flexDirection: "column",
		marginBottom: 40,
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
		justifyContent: "center"
	},
	searchBarTitleText: {
		fontSize: 30,
		fontWeight: "bold",
		color: "white"
	},
	listContainer: {
		flex: 1, 
		width: "80%",
		alignContent: "center",
		alignSelf: "center"
	},
	listItem: {
		flexDirection: "row",
		borderBottomWidth: 2,
		borderLeftWidth: 2,
		borderRightWidth: 2,
		borderColor: '#25292e',
		height: 55,
		width: "100%",
		justifyContent: "space-between",
		alignItems: "center",
	},
	resetButton: {
		height: 35,
		width: 60,
		borderWidth: 2,
		borderColor: '#25292e',
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
	listLabelContainer: {
		flexDirection: "row",
		height: 60,
		backgroundColor: '#25292e',
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
	},
	listLabel: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	listLabelText: {
		color: "white",
		fontSize: 20,
		fontWeight: "bold",
	},
	submitButton: {
		width: 200,
		height: 80,
		backgroundColor:"#25292e",
		marginTop: 30,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
	},
})