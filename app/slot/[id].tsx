import { CompactItem, Slot } from "@/assets/types/Slot";
import EditModal from "@/components/editModal";
import ItemEditTile from "@/components/itemEditComponents/itemEditTile";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { StrictMode, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function SlotScreen() {
	const { id } = useLocalSearchParams()
	const [data, setData] = useState<Slot>({
		id: "",
		items: []
	})
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
	const [modalEditValue, setModalEditValue] = useState<Slot>()

	const database = useSQLiteContext()

	const loadData = async () => {
		try {
			const quantitiesResult = await database.getAllAsync<{item_id: string, quantity: number}>("SELECT item_id, quantity FROM quantities WHERE slot_id ='" + id + "' ORDER BY item_id ASC;")
			if (typeof id == "string") {
				let parsedSlot = {
					id: id,
					items: quantitiesResult
				}
				setData(parsedSlot) 
			}
		} catch(e) {
			console.log(e)
			router.back()
		}
	}

	useEffect(() => {
		loadData()
	},[]) 

	const onEditSlots = (slot: Slot) => {
		setIsModalVisible(true)
		setModalEditValue(slot)
	}

	const onCloseModal = () => {
		loadData()
		setIsModalVisible(false)
	}

	const ItemLinks = ({item}: {item: CompactItem}) => (
		<Link 
		href={{
			pathname: '/item/[id]',
			params: {id: item.item_id}
			}}
			style={styles.itemLink}
		>
			<View style={styles.itemLinkHelper}>
				<Text>{item.item_id}</Text>
				<Text>{item.quantity}</Text>
			</View>
		</Link>
	)

	const Item = ({item}: {item: Slot}) => (
		<View style={styles.slotContainer}>
			<View style={styles.titleContainer}>
				<Text style={styles.title}>
					Slot #{id}
				</Text>
			</View>
			<View style={styles.detailContainer}>
			<View style={styles.itemLinksContainer}>
				<View style={styles.itemLinksLabel}>
					<Text style={{fontWeight: "bold"}}>ID</Text>
					<Text style={{fontWeight: "bold"}}>QUANTITY</Text>
				</View>
				<FlatList 
				data={item.items}
				renderItem={ItemLinks}
				/>
				<Pressable style={[styles.itemLinksLabel, {alignSelf: "flex-end"}]} onPress={() => onEditSlots(item)}>
					<Text>Edit Items</Text>
				</Pressable>
			</View>
		</View>
		</View>
	)

	return (
		<StrictMode>
			<Stack.Screen 
			options={{ 
				title: 'Slot Detail Screen',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
			<View style={styles.pageContainer}>
				<Item item={data}></Item>
			</View>
			<EditModal title={"Edit Items"} isVisible={isModalVisible} onClose={onCloseModal}> 
				<ItemEditTile slot={modalEditValue!} onClose={onCloseModal}></ItemEditTile>
			</EditModal>
		</StrictMode>
	)
}

const styles = StyleSheet.create({
	title: {
		fontSize: 40,
		fontWeight: "bold",
		color: "white"
	},
	titleContainer: {
		backgroundColor: "#25292e",
		flex: 1,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		justifyContent: "center",
		alignItems: "center"
	},
	detailContainer: {
		flex: 6,
		borderWidth: 4,
		borderColor: "#25292e",
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
	},
	pageContainer: {
		flex: 1,
		alignSelf: "center",
		width: "85%",
		marginTop: 90,
		alignContent: "center"
	},
	slotContainer: {
		height: 500,
	},
	itemLinksContainer: {
		flex: 1,
		alignSelf: "flex-start",
		width: "30%",
		borderRightWidth: 4,
		borderColor: "#25292e"
	},
	itemLink: {
		width: "100%",
		height: 40,
		borderBottomWidth: 2.5,
		borderColor: "#25292e",
	},
	itemLinkHelper: {
		height: "100%",
		width: "100%",
		justifyContent: "space-around",
		flexDirection: "row",
		alignItems: "center",
	},
	itemLinksLabel: {
		width: "100%",
		height: 40,
		backgroundColor: "#6c7a8b",
		borderBottomWidth: 2.5,
		borderColor: "#25292e",
		justifyContent:"space-around", 
		flexDirection: "row",
		alignItems: "center",
	}
})