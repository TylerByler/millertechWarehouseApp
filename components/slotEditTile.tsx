import { Item } from "@/assets/types/Item";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import EditMenu from "./editMenu";

export enum STATUS {
	NORMAL,
	PREEXIST,
	CHANGED,
	DELETED
}

type Props = {
	item: Item
}

export default function SlotEditTile({item}: Props) {
	const [editSlot, setEditSlot] = useState<number>(-1)
	const [isModalVisible, setIsModalVisible] = useState<boolean>()
	const [presentedData, setPresentedData] = useState<number[]>([])
	const [importantSlots, setImportantSlots] = useState<number[]>([])
	const [ids, setIds] = useState<string[]>([])
	const [statuses, setStatuses] = useState<STATUS[]>([])
	const [quantities, setQuantities] = useState<number[]>([])
	const [ogIds, setOgIds] = useState<string[]>([])
	const [ogStatuses, setOgStatuses] = useState<STATUS[]>([])
	const [ogQuantities, setOgQuantities] = useState<number[]>([])

	/* const [slots, setSlots] = useState<{id: string, quantity: number, status: STATUS}[]>([])
	const [ogSlots, setSlots] = useState<{id: string, quantity: number, status: STATUS}[]>([]) */

	const database = useSQLiteContext() 

	const loadData = async () => {
		const result = await database.getAllAsync<{id: string}>("SELECT id FROM slots")
		const newIds = new Array<string>(result.length)
		const newStatuses = new Array<STATUS>(result.length)
		const newQuantities = new Array<number>(result.length)
		const newImportantSlots = new Array<number>()
		for (let i = 0; i < result.length; i++) {
			newIds[i] = result[i].id
			newStatuses[i] = STATUS.NORMAL
			newQuantities[i] = 0
			for(let j = 0; j < item.slots.length; j++) {
				if (result[i].id === item.slots[j].id) {
					newStatuses[i] = STATUS.PREEXIST
					newQuantities[i] = item.slots[j].quantity
				}
			}
		}

		for(let i = 0; i < item.slots.length; i++) {
			newImportantSlots.push(newIds.findIndex(o => o === item.slots[i].id))
		}
		
		setIds(newIds)
		setOgIds(newIds)
		setStatuses(newStatuses)
		setOgStatuses(newStatuses)
		setQuantities(newQuantities)
		setOgQuantities(newQuantities)
		setImportantSlots(newImportantSlots)
		setPresentedData(newImportantSlots)

		/* const result = await database.getAllAsync<{id: string}>("SELECT id FROM slots")
		const newSlots = new Array<{id: string, quantity: number, status: STATUS}>()
		const importantSlots = new Array<{id: string, quantity: number, status: STATUS}>()
		for (let i = 0; i < result.length; i++) {
			newSlots[i].id = result[i].id
			newSlots[i].status = STATUS.NORMAL
			newSlots[i].quantity = 0
			for (let j = 0; j < item.slots.length; j++) {
				if (result[i].id === item.slots[j].id) {
					newSlots[i].status = STATUS.PREEXIST
					newSlots[i].quantity = item.slots[j].quantity
				}
			}
		}

		for (let i = 0; i < item.slots.length; i++) {
			importantSlots.push(newSlots)
		} */
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
	},[editSlot])

	const searchSlots = (searchedValue: string) => {
		if (searchedValue.length === 0) {
			setPresentedData(importantSlots)
			return
		}
		const newSlotList = new Array<number>()
		for (let i = 0; i < ids.length; i++) {
			let isMatch = true
			let offset = 0
			for(let j = 0; j < ids[i].length && j < searchedValue.length; j++) {
				if (ids[i][j + offset] === "-" && searchedValue[j] !== "-") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== ids[i][j + offset]) {
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
		console.log("Opened Edit Slot")
	}

	const onCloseEditSlot = () => {
		setEditSlot(-1)
		console.log("Closed Edit Slot")
	}
	
	const onSaveSlot = (value: number) => {
		const newQuantities: number[] = quantities
		newQuantities[editSlot] = value
		const newStatuses: STATUS[] = statuses
	if (ogStatuses[editSlot] == STATUS.PREEXIST) {
			if(value == 0) {
				newStatuses[editSlot] = STATUS.DELETED
			} else if (value == ogQuantities[editSlot]) {
				newStatuses[editSlot] = STATUS.PREEXIST
			} else {
				newStatuses[editSlot] = STATUS.CHANGED
			}
		} else {
			if(value == 0) {
				newStatuses[editSlot] = STATUS.NORMAL
			} else if (value == ogQuantities[editSlot]) {
				newStatuses[editSlot] = STATUS.NORMAL
			} else {
				newStatuses[editSlot] = STATUS.CHANGED
			}
		}

		setQuantities(newQuantities)
		setStatuses(newStatuses)
		console.log("IDs: ")
		console.log(ogIds)
		console.log("Statuses: ")
		console.log(ogStatuses)
		console.log("Quantities: ")
		console.log(ogQuantities)
		
		console.log("New IDs: ")
		console.log(ids)
		console.log("New Statuses: ")
		console.log(statuses)
		console.log("New Quantities: ")
		console.log(quantities)
		console.log("New Presented Data: ")
		console.log(presentedData)
		onCloseEditSlot()
	}

	const Slots = ({item}: {item: number}) => (
		<Pressable
		style={[
			styles.listItem,
			statuses[item] === STATUS.NORMAL && {backgroundColor: '#cfd7e1'},
			statuses[item] === STATUS.PREEXIST && {backgroundColor: '#98dba3'},
			statuses[item] === STATUS.CHANGED && {backgroundColor: '#ffebaf'},
			statuses[item] === STATUS.DELETED && {backgroundColor: '#ffc4c4'},
			]}
		onPress={() => onPressSlot(item)}>
			<Text>
				{ids[item]} 
				{"   "} 
				{quantities[item]}
			</Text>
		</Pressable>
	)

	return (
		<View style={styles.container}>
			<View style={styles.searchBarContainer}>
				<View style={styles.searchBarTitle}>
					<View style={styles.searchBarTitleTextContainer}>
						<Text style={styles.searchBarTitleText}>Editing Slots of Item #{item.id}</Text>
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
				<FlatList
				data={presentedData}
				renderItem={Slots}
				keyExtractor={(i) => ids[i]}
				/>
			</View>
			<Modal animationType="none" transparent={true} visible={isModalVisible}>
				<EditMenu 
				index={editSlot} 
				ids={ids} 
				quantities={quantities}
				onCloseEditSlot={onCloseEditSlot}
				onSaveSlot={onSaveSlot}
				></EditMenu>
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
	},
	searchBarContainer: {
		width: "100%",
		height: 120,
		flexDirection: "column",
		marginBottom: 20,
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
		borderBottomWidth: 2,
		borderLeftWidth: 2,
		borderRightWidth: 2,
		borderColor: '#25292e',
		height: 55,
		width: "100%",
	},
})