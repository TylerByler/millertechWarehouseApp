import { Item } from "@/assets/types/Item"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useState } from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import SlotEditMenu from "./slotEditMenu"

export enum STATUS {
	NORMAL,
	CHANGED,
	DELETED
}

type Props = {
	item: Item
	onClose: () => void
}

export default function SlotEditTile({item, onClose}: Props) {
	const [editSlot, setEditSlot] = useState<number>(-1)
	const [isModalVisible, setIsModalVisible] = useState<boolean>()
	const [presentedData, setPresentedData] = useState<number[]>([])
	const [importantSlots, setImportantSlots] = useState<number[]>([])
	const [slots, setSlots] = useState<{slotId: string, quantity: number, status: STATUS, isOgSlot: boolean}[]>([])
	const [ogSlots, setOgSlots] = useState<{slotId: string, quantity: number, status: STATUS, isOgSlot: boolean}[]>([])

	const database = useSQLiteContext() 

	const loadData = async () => {
		const result = await database.getAllAsync<{id: string}>("SELECT id FROM slots")
		const newSlots = new Array<{slotId: string, quantity: number, status: STATUS, isOgSlot: boolean}>()
		const newPresentedData = new Array<number>()
		for (let i = 0; i < result.length; i++) {
			newSlots.push({
				slotId: result[i].id,
				status: STATUS.NORMAL,
				quantity: 0,
				isOgSlot: false
			})
			for (let j = 0; item.slots !== null && j < item.slots.length; j++) {
				if (result[i].id === item.slots[j].id) {
					newSlots[newSlots.length-1].isOgSlot = true
					newSlots[newSlots.length-1].quantity = item.slots[j].quantity
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

	},[slots])

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
			for(let j = 0; j < slots[i].slotId.length && j < searchedValue.length; j++) {
				if (slots[i].slotId[j + offset] === "-" && searchedValue[j] !== "-") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== slots[i].slotId[j + offset]) {
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
		let newSlot: {slotId: string, quantity: number, status: STATUS, isOgSlot: boolean}
		const newSlotId = slots.findIndex(e => e.slotId === slots[slotIndex].slotId)
		const previousQuantity = ogSlots[newSlotId].quantity

		newSlot = {
			slotId: slots[slotIndex].slotId,
			quantity: updatedSlotQuantity,
			status: STATUS.CHANGED,
			isOgSlot: slots[slotIndex].isOgSlot
		}

		if (updatedSlotQuantity <= 0) {
			newSlot = {
				slotId: slots[slotIndex].slotId,
				quantity: 0,
				status: STATUS.DELETED,
				isOgSlot: slots[slotIndex].isOgSlot
			}
		}
		if (updatedSlotQuantity === previousQuantity) {
			newSlot = {
				slotId: slots[slotIndex].slotId,
				quantity: updatedSlotQuantity,
				status: STATUS.NORMAL,
				isOgSlot: slots[slotIndex].isOgSlot
			}
		}
		const indexOfSlot = slots.findIndex(e => e.slotId === newSlot.slotId)

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

		slots[slots.findIndex(e => e.slotId === newSlot.slotId)] = newSlot
		setPresentedData([...importantSlots])
	}

	const onSubmitDataToDB = async () => {
		const finalSlots = slots.filter(e => e.quantity !== 0 || e.isOgSlot)
		let itemUpdateStatement = ""
		let slotsRetrieveStatement = ""

		// ITERATE THROUGH SLOTS ON ITEM
		// For each slot, we want to add both the id and the quantity to the itemUpdateStatement
		finalSlots.map((e, index) => {
			if (e.quantity !== 0) {
				itemUpdateStatement += ("json_object('id', '" + e.slotId + "', 'quantity', " + e.quantity.toString() + ")")

				if (index < finalSlots.length - 1) {
					itemUpdateStatement += ", "
				}
			}

			slotsRetrieveStatement += ("'" + e.slotId + "'")

			if (index < finalSlots.length - 1) {
				slotsRetrieveStatement += ", "
			}
		})

		// ITERATE THROUGH SLOTS ON ITEM & OGSLOTS
		// For each slot, we want to get the items in that slot
		// Check for ITEM within each slots items, remove it from the array
		// Send back updated item list to slot
		const parsedResult = new Array<{slotId: string, items: string[]}>()
		try {
			const result = await database.getAllAsync<{id: string, items: string}>("SELECT id, items FROM slots WHERE id IN (" + slotsRetrieveStatement + ")")
			for (var i = 0; i < result.length; i++) {
				parsedResult[i] = {
					slotId: result[i].id,
					items: JSON.parse(result[i].items)
				}
			}
		} catch (e) {
			console.log(e)
		}

		parsedResult.forEach(async (e, index) => {
			var isItemInSlot: boolean = false
			var ogLength = e.items.length
			for (var i = 0; i < ogLength; i++) {
				if (e.items[i] == item.id) {
					if (finalSlots[finalSlots.findIndex((x) => (x.slotId == e.slotId))].quantity == 0) {
						var temp = e.items[i]
						e.items[i] = e.items[ogLength - 1]
						e.items[ogLength - 1] = temp
						e.items.pop()
					}
					isItemInSlot = true
					break
				}
			}

			if (isItemInSlot === false) {
				e.items.push(item.id)
				e.items.sort()
			}

			var slotUpdateStatement = ""
			for (var i = 0; i < e.items.length; i++) {
				slotUpdateStatement += ("'" + e.items[i] + "'")
				if (i < e.items.length - 1) {
					slotUpdateStatement += ", "
				}
			}

			try {
				await database.runAsync("UPDATE slots SET items = json_array(" + slotUpdateStatement + ") WHERE id = '" + e.slotId + "';")
			} catch (error) {
				console.log(error)
			}
		})

		try {
			await database.runAsync("UPDATE items SET slots = json_array(" + itemUpdateStatement + ") WHERE id = '" + item.id + "';")
		} catch(e) {
			console.log(e)
		}
		onClose()
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
						{slots[item].slotId} 
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
				keyExtractor={(i) => slots[i].slotId}
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