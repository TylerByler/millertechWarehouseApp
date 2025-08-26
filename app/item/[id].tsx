import { CompactSlot, Item } from "@/assets/types/Item";
import EditModal from "@/components/editModal";
import SlotEditTile from "@/components/slotEditComponents/slotEditTile";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { StrictMode, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function ItemScreen() {
	const { id } = useLocalSearchParams()
	const [data, setData] = useState<Item>({
		id: "",
		name: "",
		primarySlot: "",
		slots: [],
		description: ""
	})
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
	const [modalEditValue, setModalEditValue] = useState<Item>()

	const database = useSQLiteContext()

	const loadData = async () => {
		try {
			const itemResult = await database.getAllAsync<{id: string, name: string, primaryslot: string, desc: string}>("SELECT * FROM items WHERE id ='" + id + "' ORDER BY id ASC;")
			const quantitiesResult = await database.getAllAsync<{slot_id: string, quantity: number}>("SELECT slot_id, quantity FROM quantities WHERE item_id = '" + id + "' ORDER BY slot_id ASC;");
			if (typeof id == "string") {
				let parsedItem = {
					id: id,
					name: itemResult[0].name,
					primarySlot: itemResult[0].primaryslot,
					slots: quantitiesResult,
					description: itemResult[0].desc
				}
				setData(parsedItem)
			}
		} catch(e) {
			console.log(e)
			router.back()
		}
	}

	useEffect(() => {
		console.log("item/[id]: Modal Edit Value Changed")
		console.log(modalEditValue)
	}, [modalEditValue])

	useEffect(() => {
		loadData();
		setModalEditValue(data)
	},[])

	const onEditSlots = (item: Item) => {
		setIsModalVisible(true)
		setModalEditValue(item)
	}

	const onCloseModal = () => {
		loadData()
		setIsModalVisible(false)
	}

	const SlotLinks = ({item}: {item: CompactSlot}) => (
		<Link 
		href={{
			pathname: '/slot/[id]',
			params: {id: item.slot_id}
			}}
			style={styles.slotLink}
		>
			<View style={styles.slotLinkHelper}>
				<Text>{item.slot_id}</Text>
				<Text>{item.quantity}</Text>
			</View>
		</Link>
	)
	
	return (
		<StrictMode>
			<Stack.Screen 
			options={{ 
				title: 'Item Detail Screen',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
			<View style={styles.pageContainer}>
				<View style={styles.itemContainer}>
					<View style={styles.titleContainer}>
						<Text style={styles.title}>
							Item #{data.id}
						</Text>
					</View>
					<View style={styles.detailContainer}>
						<View style={styles.slotLinksContainer}>
							<View style={[styles.slotLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
								<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>SLOTS</Text>
							</View>
							<View style={styles.slotLinksLabel}>
								<View style={{flex: 1, alignItems: "center"}}>
									<Text style={{fontWeight: "bold"}}>ID</Text>
									</View>
								<View style={{flex: 1, alignItems: "center"}}>
									<Text style={{fontWeight: "bold"}}>QUANTITY</Text>
								</View>
							</View>
							<FlatList 
							data={data.slots}
							renderItem={SlotLinks}
							/>
							<Pressable style={[styles.slotLinksLabel, {alignSelf: "flex-end"}]} onPress={() => onEditSlots(data)}>
								<Text>Edit Slots</Text>
							</Pressable>
						</View>
					</View>
				</View>
				<EditModal title={"Edit Slots"} isVisible={isModalVisible} onClose={onCloseModal}>
					<SlotEditTile item={modalEditValue!} onClose={onCloseModal}></SlotEditTile>
				</EditModal>
			</View>
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
		alignContent: "center",
	},
	itemContainer: {
		height: 500,
	},
	slotLinksContainer: {
		flex: 1,
		alignSelf: "flex-start",
		width: "30%",
		borderRightWidth: 4,
		borderColor: "#25292e"
	},
	slotLink: {
		width: "100%",
		height: 40,
		borderBottomWidth: 2.5,
		borderColor: "#25292e",
	},
	slotLinkHelper: {
		height: "100%",
		width: "100%",
		justifyContent: "space-around",
		flexDirection: "row",
		alignItems: "center",
	},
	slotLinksLabel: {
		width: "100%",
		height: 30,
		backgroundColor: "#6c7a8b",
		borderBottomWidth: 2.5,
		borderColor: "#25292e",
		justifyContent: "center",
		flexDirection: "row",
		alignItems: "center",
	}
})