import { CompactSlot, Item } from "@/assets/types/Item";
import { Link, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ItemScreen() {
	const { id } = useLocalSearchParams()
	const [data, setData] = useState<Item>({
		id: "",
		name: "",
		primarySlot: "",
		slots: [],
		description: "",
	})
	const [quantityTotal, setQuantityTotal] = useState<number>(0)
	const [modalEditValue, setModalEditValue] = useState<Item>()

	const database = useSQLiteContext()

	const loadData = async () => {
		try {
			const itemResult = await database.getAllAsync<{id: string, name: string, primaryslot: string, description: string}>("SELECT * FROM items WHERE id ='" + id + "' ORDER BY id ASC;")
			const quantitiesResult = await database.getAllAsync<{slot_id: string, quantity: number}>("SELECT slot_id, quantity FROM quantities WHERE item_id = '" + id + "' ORDER BY slot_id ASC;");
			if (typeof id == "string") {
				let parsedItem = {
					id: id,
					name: itemResult[0].name,
					primarySlot: itemResult[0].primaryslot,
					slots: quantitiesResult,
					description: itemResult[0].description
				}
				let newQuantityTotal = 0
				parsedItem.slots.forEach(e => {
					newQuantityTotal += e.quantity
				});
				setData(parsedItem)
				setQuantityTotal(newQuantityTotal)
			}
		} catch(e) {
			console.log(e)
		}
	}

	useFocusEffect(
		useCallback(() => {
			if (database) {
				loadData();
			}
		}, [database])
	)

	useEffect(() => {
		console.log("item/[id]: Modal Edit Value Changed")
		console.log(modalEditValue)
	}, [modalEditValue])

	useEffect(() => {
		setModalEditValue(data)
	},[])

	const SlotLinks = ({item}: {item: CompactSlot}) => (
		<Link 
		href={{
			pathname: '/slot/[id]/overview',
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
	
	if (!database) {
		return <View><Text>Loading...</Text></View>
	}
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
						<View style={{flex: 1}}>
							<View style={styles.slotLinksContainer}>
								<View style={[styles.slotLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
									<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>Slots</Text>
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
								<Link href={{
									pathname: '/item/[id]/quantityEdit',
									params: {id: data.id}
								}}
								style={[
									styles.slotLinksLabel,
									{
										alignSelf: "flex-end",
										borderTopWidth: 2.5,
										borderBottomLeftRadius: 12,
										borderBottomWidth: 0
									}
								]}
								>
									<Text>Edit Slots</Text>
								</Link>
							</View>
						</View>
						<View style={{flex: 1}}>
							<View style={[styles.descriptionContainer, {flex: 2}]}>
								<View style={[styles.slotLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
									<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>Description</Text>
								</View>
								<ScrollView style={styles.description}>
									<Text>{data.description}</Text>
								</ScrollView>
								<Link href={{
									pathname: '/item/[id]/descriptionEdit',
									params: {id: data.id}
								}}
								style={[
									styles.slotLinksLabel,
									{
										alignSelf: "flex-end",
										borderTopWidth: 2.5,
									}
								]}
								>
									<Text>Edit Description</Text>
								</Link>
							</View>
							<View style={styles.descriptionContainer}>
								<View style={[styles.slotLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
									<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>Totals</Text>
								</View>
								<View style={styles.slotLinksLabel}>
									<View style={{flex: 1, alignItems: "center"}}>
										<Text style={{fontWeight: "bold"}}>SLOTS</Text>
									</View>
									<View style={{flex: 1, alignItems: "center"}}>
										<Text style={{fontWeight: "bold"}}>QUANTITY</Text>
									</View>
								</View>
								<View style={styles.totalNumbersContainer}>
									<Text>{data.slots.length}</Text>
									<Text>{quantityTotal}</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
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
		flex: 2,
		flexDirection: "row",
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
		textAlign: "center",
		textAlignVertical: "center",
	},
	descriptionContainer: {
		flex: 1,
		flexDirection: "column",
	},
	description: {
		flex: 1,
		padding: "2%"
	},
	totalNumbersContainer: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center"
	}
})