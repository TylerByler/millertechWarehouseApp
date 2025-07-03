import { Item } from "@/assets/types/Item"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useState } from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import EditMenu from "./editMenuRework"

export enum STATUS {
	NORMAL,
	CHANGED,
	DELETED
}

type Props = {
	item: Item
}

export default function SlotEditTile({item}: Props) {
	/* const [editSlot, setEditSlot] = useState<{id: string, quantity: number, status: STATUS, isOgSlot: boolean}>({
		id: "", 
		quantity: -1,
		status: STATUS.NORMAL,
		isOgSlot: false
	}) */

	const [editSlot, setEditSlot] = useState<number>(-1)
	const [isModalVisible, setIsModalVisible] = useState<boolean>()
	const [presentedData, setPresentedData] = useState<number[]>([])
	const [importantSlots, setImportantSlots] = useState<number[]>([])
	const [slots, setSlots] = useState<{id: string, quantity: number, status: STATUS, isOgSlot: boolean}[]>([])
	const [ogSlots, setOgSlots] = useState<{id: string, quantity: number, status: STATUS, isOgSlot: boolean}[]>([])

	const database = useSQLiteContext() 

	const loadData = async () => {
		const result = await database.getAllAsync<{id: string}>("SELECT id FROM slots")
		const newSlots = new Array<{id: string, quantity: number, status: STATUS, isOgSlot: boolean}>(result.length)
		const newPresentedData = new Array<number>()
		for (let i = 0; i < result.length; i++) {
			newSlots[i] = {
				id: result[i].id,
				status: STATUS.NORMAL,
				quantity: 0,
				isOgSlot: false
			}
			for (let j = 0; j < item.slots.length; j++) {
				if (result[i].id === item.slots[j].id) {
					newSlots[i].isOgSlot = true;
					newSlots[i].quantity = item.slots[j].quantity
					newPresentedData.push(i)
				}
			}
		}

		setSlots(newSlots)
		setOgSlots([...newSlots])
		setPresentedData(newPresentedData)
		setImportantSlots(newPresentedData)
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
			for(let j = 0; j < slots[i].id.length && j < searchedValue.length; j++) {
				if (slots[i].id[j + offset] === "-" && searchedValue[j] !== "-") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== slots[i].id[j + offset]) {
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

	const onSubmit = (slot: {id: string, quantity: number, status: STATUS, isOgSlot: boolean}) => {
		console.log(slot)
		const indexOfSlot = slots.findIndex(e => e.id === slot.id)

		if (!slot.isOgSlot) {
			if (slot.status !== STATUS.NORMAL) {
				importantSlots.push(indexOfSlot)
				importantSlots.sort()
			} else {
				const valueIndex = importantSlots.findIndex((e) => e === indexOfSlot)
				const tmpA = importantSlots[valueIndex]
				const tmpB = importantSlots[importantSlots.length - 1]

				importantSlots[valueIndex] = tmpB
				importantSlots[importantSlots.length - 1] = tmpA

				importantSlots.pop()
				console.log("Important Slots after swizzle")
				console.log(importantSlots)
			}
		}

		slots[slots.findIndex(e => e.id == slot.id)] = slot
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
			onPress={() => onPressSlot(item)}>
				<Text>
					{slots[item].id} 
					{"   "} 
					{slots[item].quantity}
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
				keyExtractor={(i) => slots[i].id}
				/>
			</View>
			<Modal animationType="none" transparent={true} visible={isModalVisible}>
				<EditMenu 
				slot={slots[editSlot]}
				ogQuantity={ogSlots[editSlot] !== undefined ? ogSlots[editSlot].quantity : 0}
				onCloseEditSlot={onCloseEditSlot}
				onSubmit={onSubmit}
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