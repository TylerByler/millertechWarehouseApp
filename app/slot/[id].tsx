import { Slot, TempSlot } from "@/assets/types/Slot";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { StrictMode, useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function SlotScreen() {
	const { id } = useLocalSearchParams()
	const [data, setData] = useState<Slot[]>([])

	const database = useSQLiteContext()

	const loadData = async () => {
		try {
			var query: string = "SELECT * FROM slots WHERE id = '" + id + "';"
			const result = await database.getAllAsync<TempSlot>(query)
			let parsedSlots = new Array<Slot>(result.length)
			for (let i = 0; i < result.length; i++) {
				parsedSlots[i] = {
					id: result[i].id,
					items: JSON.parse(result[i].items),
					xPos: result[i].xPos,
					yPos: result[i].yPos,
					zPos: result[i].zPos
				}
			}
			console.log(parsedSlots)
			setData(parsedSlots) 
		} catch(e) {
			console.log(e)
			router.back()
		}
	}

	useEffect(() => {
		loadData()
	},[]) 

	const ItemLinks = ({item}: {item: string}) => (
		<Link 
		href={{
			pathname: '/item/[id]',
			params: {id: item}
			}}
			style={styles.itemLink}
		>
			<View style={styles.itemLinkHelper}>
				<Text>{item}</Text>
				<Text>0</Text>
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
			</View>
		</View>
		</View>
	)

	return (
		<StrictMode>
			<View style={styles.pageContainer}>
				<FlatList 
				data={data}
				renderItem={Item}
				keyExtractor={(item) => item.id}
				/>
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