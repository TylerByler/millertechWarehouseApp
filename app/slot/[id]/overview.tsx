import { CompactItem, Slot } from "@/assets/types/Slot";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";


export default function SlotScreen() {
	const { id } = useLocalSearchParams()
	const [data, setData] = useState<Slot>({
		id: "",
		items: [],
		isReady: 0
	})
	const [quantityTotal, setQuantityTotal] = useState<number>()

	const database = useSQLiteContext();
	const fileIndicator = "\n^IN SLOT PAGE^";

	const loadData = async () => {
		try {
			console.log("id: " + id)
			const slotResult = await database.getFirstAsync<{id: string, is_ready: number}>("SELECT * FROM slots WHERE id ='" + id + "';")
			const quantitiesResult = await database.getAllAsync<{item_id: string, quantity: number}>("SELECT item_id, quantity FROM quantities WHERE slot_id ='" + id + "' ORDER BY item_id ASC;")
			if (typeof id === "string" && slotResult) {
				let parsedSlot = {
					id: slotResult.id,
					items: quantitiesResult,
					isReady: slotResult.is_ready
				}
				let newQuantityTotal = 0
				parsedSlot.items.forEach(e => {
					newQuantityTotal += e.quantity
				});
				setData(parsedSlot) 
				setQuantityTotal(newQuantityTotal)
				console.log("Loaded Data")
			}
		} catch(e) {
			console.log(e + fileIndicator)
			router.back()
		}
	}

	useFocusEffect(
		useCallback(() => {
			loadData()
		}, [])
	)

	useEffect(() => {
		console.log("Data: ")
		console.log(data)
	}, [data])


	const setReady = async () => {
		await database.execAsync("UPDATE slots SET is_ready = TRUE WHERE id = '" + data.id + "';")
		let newData = {
			id: data.id,
			items: data.items,
			isReady: 1
		};
		setData(newData)
	}

	const setNotReady = async () => {
		await database.execAsync("UPDATE slots SET is_ready = FALSE WHERE id = '" + data.id + "';")
		let newData = {
			id: data.id,
			items: data.items,
			isReady: 0
		};
		setData(newData)
	}

	const ItemLinks = ({item}: {item: CompactItem}) => (
		<Link 
		href={{
			pathname: '/item/[id]/overview',
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

	return (	
		<View style={styles.pageContainer}>
			<Stack.Screen 
			options={{ 
				title: 'Slot Detail Screen',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
			<View style={styles.slotContainer}>
				<View style={styles.titleContainer}>
					<Text style={styles.title}>
						Slot #{id}
					</Text>
				</View>
				<View style={styles.detailContainer}>
					<View style={{flex: 1}}>
						<View style={styles.itemLinksContainer}>
							<View style={[styles.itemLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
								<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>Items</Text>
							</View>
							<View style={styles.itemLinksLabel}>
								<View style={{flex: 1, alignItems: "center"}}>
									<Text style={{fontWeight: "bold"}}>ID</Text>
								</View>
								<View style={{flex: 1, alignItems: "center"}}>
									<Text style={{fontWeight: "bold"}}>QUANTITY</Text>
								</View>
							</View>
							<FlatList 
							data={data.items}
							renderItem={ItemLinks}
							/>
							<Link href={{
								pathname: '/slot/[id]/quantityEdit',
								params: {id: data.id}
							}}
							style={[
								styles.itemLinksLabel,
								{
									alignSelf: "flex-end",
									borderTopWidth: 2.5,
									borderBottomLeftRadius: 12,
									borderBottomWidth: 0
								}
							]}
							>
								<Text>Edit Items</Text>
							</Link>
						</View>
					</View>
					<View style={{flex: 1}}>
						<View style={styles.readyContainer}>
							<View style={[styles.itemLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
								<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>Ready to go?</Text>
							</View>
							<View style={styles.ready}>
								{data.isReady == 0 && 
								<Pressable onPress={() => setReady()}>
									<Text>
										<MaterialIcons name="check-box-outline-blank" size={120}></MaterialIcons>
									</Text>
								</Pressable>
								}
								{data.isReady == 1 && 
								<Pressable onPress={() => setNotReady()}>
									<Text>
										<MaterialIcons name="check-box" size={120}></MaterialIcons>
									</Text>
								</Pressable>
								}
							</View>
						</View>
						<View style={styles.descriptionContainer}>
							<View style={[styles.itemLinksLabel, {backgroundColor: "#3b434d", height: 40}]}>
								<Text style={{fontWeight: "bold", fontSize: 20, color: "white"}}>Totals</Text>
							</View>
							<View style={styles.itemLinksLabel}>
								<View style={{flex: 1, alignItems: "center"}}>
									<Text style={{fontWeight: "bold"}}>ITEMS</Text>
								</View>
								<View style={{flex: 1, alignItems: "center"}}>
									<Text style={{fontWeight: "bold"}}>QUANTITY</Text>
								</View>
							</View>
							<View style={styles.totalNumbersContainer}>
								<Text>{data.items.length}</Text>
								<Text>{quantityTotal}</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
		</View>
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
		alignContent: "center"
	},
	slotContainer: {
		height: 500,
	},
	itemLinksContainer: {
		flex: 1,
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
	readyContainer: {
		flex: 2,
		flexDirection: "column",
	},
	ready: {
		flex: 1,
		alignContent: "center",
		alignItems: "center",
		justifyContent: "center",
	},
	totalNumbersContainer: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center"
	},
	descriptionContainer: {
		flex: 1,
		flexDirection: "column",
	},
})