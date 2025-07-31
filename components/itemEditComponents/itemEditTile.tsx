import { CompactSlot } from "@/assets/types/Item"
import { Slot } from "@/assets/types/Slot"
import { useSQLiteContext } from "expo-sqlite"
import { useEffect, useState } from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import ItemEditMenu from "./itemEditMenu"

export enum STATUS {
	NORMAL,
	CHANGED,
	DELETED
}

type Props = {
	slot: Slot
	onClose: () => void
}

export default function ItemEditTile({slot, onClose}: Props) {
	const [editItem, setEditItem] = useState<number>(-1)
	const [isModalVisible, setIsModalVisible] = useState<boolean>()
	const [presentedData, setPresentedData] = useState<number[]>([])
	const [importantItems, setImportantItems] = useState<number[]>([])
	const [items, setItems] = useState<{itemId: string, quantity: number, status: STATUS, isOgItem: boolean}[]>([])
	const [ogItems, setOgItems] = useState<{itemId: string, quantity: number, status: STATUS, isOgItem: boolean}[]>([])

	const database = useSQLiteContext()

	const loadData = async () => {
		try {
			const result = await database.getAllAsync<{id: string, slots: string}>("SELECT id, slots FROM items")
			const newItems = new Array<{itemId: string, quantity: number, status: STATUS, isOgItem: boolean}>()
			const newPresentedData = new Array<number>()
			for (let i = 0; i < result.length; i++) {
				let tempSlots: {id: string, quantity: number}[] = JSON.parse(result[i].slots)
				newItems.push({
					itemId: result[i].id,
					status: STATUS.NORMAL,
					quantity: 0,
					isOgItem: false,
				})
				for (let j = 0; tempSlots !== null && j < tempSlots.length; j++) {
					if (slot.id === tempSlots[j].id) {
						newItems[newItems.length-1].quantity = tempSlots[j].quantity
					}
				}
				for (let j = 0; j < slot.items.length; j++) {
					if (result[i].id === slot.items[j]) {
						newItems[newItems.length-1].isOgItem = true
						newPresentedData.push(newItems.length-1)
					}
				}
			}
			setItems(newItems)
			setOgItems([...newItems])
			setPresentedData(newPresentedData)
			setImportantItems([...newPresentedData])
		} catch(e) {
			console.log(e)
		}
	}

	useEffect(() => {
		loadData()
	},[])

	useEffect(() => {
		if (editItem < 0) {
			setIsModalVisible(false)
		} else {
			setIsModalVisible(true)
		}
	}, [editItem])


	const searchItems = (searchedValue: string) => {
		if (searchedValue.length === 0) {
			setPresentedData(importantItems)
			return
		}
		const newItemList = new Array<number>()
		for (let i = 0; i < items.length; i++) {
			let isMatch = true
			for (let j = 0; j < items[i].itemId.length && j < searchedValue.length; j++) {
				if (searchedValue[j].toUpperCase() !== items[i].itemId[j]) {
					isMatch = false
				}
			}
			if (isMatch && !newItemList.includes(i)) {
				newItemList.push(i)
			}
		}
		setPresentedData(newItemList)
	}

	const onPressItem = (id: number) => {
		setEditItem(id)
	}

	const onCloseEditItem = () => {
		setEditItem(-1)
	}

	const onReset = (index: number) => {
		onSubmitItemEdit(index,ogItems[index].quantity)
	}

	const onSubmitItemEdit = (itemIndex: number, updatedItemQuantity: number) => {
		// YET TO BE IMPLEMENTED
		// will make an update to a position in the items array 
		let newItem: {itemId: string, quantity: number, status: STATUS, isOgItem: boolean}
		const newItemId = items.findIndex(e => e.itemId === items[itemIndex].itemId)
		const previousQuantity = ogItems[newItemId].quantity

		newItem = {
			itemId: items[itemIndex].itemId,
			quantity: updatedItemQuantity,
			status: STATUS.CHANGED,
			isOgItem: items[itemIndex].isOgItem
		}

		if (updatedItemQuantity <= 0) {
			newItem = {
				itemId: items[itemIndex].itemId,
				quantity: 0,
				status: STATUS.DELETED,
				isOgItem: items[itemIndex].isOgItem
			}
		}
		if (updatedItemQuantity === previousQuantity) {
			newItem = {
				itemId: items[itemIndex].itemId,
				quantity: updatedItemQuantity,
				status: STATUS.NORMAL,
				isOgItem: items[itemIndex].isOgItem
			}
		}
		const indexOfItem = items.findIndex(e => e.itemId === newItem.itemId)

		if (!newItem.isOgItem) {
			if (newItem.status !== STATUS.NORMAL) {
				importantItems.push(indexOfItem)
				importantItems.sort()
			} else {
				const valueIndex = importantItems.findIndex((e) => e === indexOfItem)
				const tmpA = importantItems[valueIndex]
				const tmpB = importantItems[importantItems.length - 1]

				importantItems[valueIndex] = tmpB
				importantItems[importantItems.length - 1] = tmpA

				importantItems.pop()
			}
		}

		items[items.findIndex(e => e.itemId === newItem.itemId)] = newItem
		setPresentedData([...importantItems])
	}

	const onSubmitDataToDB = async () => {
		// YET TO BE IMPLEMENTED
		// Will take all the changed data and send it to the database
		// Must make correct changes to both the item table as well as the slot table
		// In order to do that we must send the quantity to the item table, and send the updated item list to the slot table
		
		const finalItems = items.filter(e => e.quantity !== 0 || e.isOgItem)
		let slotUpdateStatement = ""
		let itemRetrieveStatment = ""
		finalItems.map((e, index) => {
			if (e.quantity !== 0) {
				slotUpdateStatement += ("'" + e.itemId + "'")
				if (index < finalItems.length - 1) {
					slotUpdateStatement += ", "
				}
			}

			itemRetrieveStatment += ("'" + e.itemId + "'")

			if (index < finalItems.length - 1) {
				itemRetrieveStatment += ", "
			}
		})

		const parsedResult = new Array<{itemId: string, slots: CompactSlot[]}>()
		try {
			const result = await database.getAllAsync<{id: string, slots: string}>("SELECT id, slots FROM items WHERE id IN (" + itemRetrieveStatment + ")")
			for (var i = 0; i < result.length; i++) {
				parsedResult[i] = {
					itemId: result[i].id,
					slots: JSON.parse(result[i].slots)
				}
			}
		} catch (e) {
			console.log(e)
		}

		for (var i = 0; i < parsedResult.length; i++) {
			var slotFoundInItem: boolean = false
			for (var j = 0; j < parsedResult[i].slots.length; j++) {
				if (parsedResult[i].slots[j].id === slot.id) {
					// UPDATE PREXISTING QUANTITY
					if (finalItems[finalItems.findIndex((e) => (e.itemId === parsedResult[i].itemId))].quantity == 0) {
						var temp = parsedResult[i].slots[j]
						parsedResult[i].slots[j] = parsedResult[i].slots[parsedResult[i].slots.length - 1]
						parsedResult[i].slots[parsedResult[i].slots.length - 1] = temp
						parsedResult[i].slots.pop()
						slotFoundInItem = true
						break
					}

					parsedResult[i].slots[j].quantity = finalItems[finalItems.findIndex((e) => (e.itemId === parsedResult[i].itemId))].quantity
					slotFoundInItem = true
				}
			}
			if (!slotFoundInItem) {
				// ADD NEW SLOT ID AND QUANTITY
				parsedResult[i].slots.push({id: slot.id, quantity: finalItems[finalItems.findIndex((e) => (e.itemId === parsedResult[i].itemId))].quantity})
				parsedResult[i].slots.sort((a, b) => {
					if (a.id < b.id) return -1;
					if (a.id > b.id) return 1;
					return 0;
				})
			}
		}

		// CREATE STATEMENT FOR SETTING SLOTS OF ITEM
		try {
			for (var i = 0; i < parsedResult.length; i++) {
				let itemsUpdateStatement = ""
				parsedResult[i].slots.map((e, index) => {
					itemsUpdateStatement += ("json_object('id', '" + e.id + "', 'quantity', " + e.quantity.toString() + ")")
					if (index < parsedResult[i].slots.length - 1) {
						itemsUpdateStatement += ", "
					}
				})
				
				await database.runAsync("UPDATE items SET slots = json_array(" + itemsUpdateStatement + ") WHERE id = '" + parsedResult[i].itemId + "';")
			}
		} catch (e) {
			console.log(e)
		}

		try {
			await database.runAsync("UPDATE slots SET items = json_array(" + slotUpdateStatement + ") WHERE id = '" + slot.id + "';")
		} catch (e) {
			console.log(e)
		}
		onClose()
	}

	const Items = ({item}: {item: number}) => (
		<Pressable
		style={[
			styles.listItem,
			items[item].status === STATUS.NORMAL && !items[item].isOgItem && {backgroundColor: '#cfd7e1'},
			items[item].status === STATUS.NORMAL && items[item].isOgItem && {backgroundColor: '#8fffa9'},
			items[item].status === STATUS.CHANGED && {backgroundColor: '#ffebaf'},
			items[item].status === STATUS.DELETED && {backgroundColor: '#ffc4c4'},
		]}
		onPress={() => onPressItem(item)}
		>
			<View style={styles.listLabel}>
				<Text>
					{items[item].itemId}
				</Text>
			</View>
			<View style={styles.listLabel}>
				<Text>
					{items[item].quantity}
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
						<Text style={styles.searchBarTitleText}>Editing Items of Slot #{slot.id}</Text>
					</View>
				</View>
				<TextInput 
				style={styles.searchBar}
				placeholder="Enter Item ID..."
				placeholderTextColor={"grey"}
				onChangeText={(value) => {
					searchItems(value)
				}}
				/>
			</View>
			<View style={styles.listContainer}>
				<View style={styles.listLabelContainer}>
					<View style={styles.listLabel}>
						<Text style={styles.listLabelText}>Item</Text>
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
				renderItem={Items}
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
				<ItemEditMenu
				itemIndex={editItem}
				item={items[editItem]}
				ogQuantity={ogItems[editItem] !== undefined ? ogItems[editItem].quantity:0}
				onCloseEditItem={onCloseEditItem}
				onSubmit={onSubmitItemEdit}
				></ItemEditMenu>
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