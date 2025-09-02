import { Link, router, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

enum Tab {
	ITEM,
	SLOT
}

export default function Search() {
	const [selectedTab, setSelectedTab] = useState<Tab>(Tab.ITEM)
	const [slots, setSlots] = useState<string[]>([])
	const [items, setItems] = useState<string[]>([])
	const [filteredSlots, setFilteredSlots] = useState<string[]>([])
	const [filteredItems, setFilteredItems] = useState<string[]>([])

	const database = useSQLiteContext()
	const fileIndicator = "\n^ IN SEARCH ^"

	
	const loadSlots = async () => {
		try {
			const slotResult = await database.getAllAsync<{id: string}>("SELECT id FROM slots ORDER BY SUBSTR(id, 1, 1), CAST(SUBSTR(id, 3) AS INTEGER);");
			const parsedSlots = new Array<string>()
			for(let i = 0; i < slotResult.length; i++) {
				parsedSlots.push(slotResult[i].id)
			}
			setSlots(parsedSlots);
			setFilteredSlots(parsedSlots);
		} catch(e) {
			console.error(e + fileIndicator)
			router.back()
		}
		
	}

	const loadItems = async () => {
		try {
			const itemResult = await database.getAllAsync<{id: string}>("SELECT id FROM items ORDER BY id ASC;");
			const parsedItems = new Array<string>()
			for(let i = 0; i < itemResult.length; i++) {
				parsedItems.push(itemResult[i].id)
			}
			setItems(parsedItems);
			setFilteredItems(parsedItems);
		} catch(e) {
			console.log(e + fileIndicator)
			router.back()
		}
	}

	const searchItems = (searchedValue: string) => {
		if (searchedValue === "") {
			setFilteredItems(items)
			return
		}
		const newItemList = new Array<string>()
		for (let i = 0; i < items.length; i++) {
			let isMatch = true
			let offset = 0
			for (let j = 0; j + offset < items[i].length && j < searchedValue.length; j++) {
				if (searchedValue.length > items[i].length - offset) {
					isMatch = false;
				}
				if (items[i][j + offset]==="#" && searchedValue[j] !== "#") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== items[i][j + offset]) {
					isMatch = false
				}
			}
			if (isMatch && !newItemList.includes(items[i])) {
				newItemList.push(items[i])
			}
		}
		setFilteredItems(newItemList)
	}

	const searchSlots = (searchedValue: string) => {
		if (searchedValue.length === 0) {
			setFilteredSlots(slots)
			return
		}
		const newSlotList = new Array<string>()
		for (let i = 0; i < slots.length; i++) {
			let isMatch = true
			let offset = 0
			for (let j = 0; j + offset < slots[i].length && j < searchedValue.length; j++) {
				if (searchedValue.length > slots[i].length - offset) {
					isMatch = false;
				}
				if (slots[i][j + offset] === "-" && searchedValue[j] !== "-") {
					offset++
				}
				if (searchedValue[j].toUpperCase() !== slots[i][j + offset]) {
					isMatch = false
				}
			}
			if (isMatch && !newSlotList.includes(slots[i])) {
				newSlotList.push(slots[i])
			}
		}
		setFilteredSlots(newSlotList)
	}

	useEffect(() => {
		loadSlots()
		loadItems()
	},[]) 

	return (
		<View style={styles.container}>
			<Stack.Screen 
			options={{ 
				title: 'Search',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
			<View style={styles.searchBarContainer}>
				<View style={styles.tabContainer}>
					<Pressable 
						style={selectedTab === Tab.ITEM ? styles.activeTab:styles.tab}
						onPress={() => {
							setSelectedTab(Tab.ITEM)
							loadItems()
						}}
					>
						<Text style={selectedTab === Tab.ITEM && {color: 'white'}}>Search Items</Text>
					</Pressable>
					<Pressable 
						style={selectedTab === Tab.SLOT ? [styles.activeTab, styles.finalTab]:[styles.tab, styles.finalTab]}
						onPress={() => {
							setSelectedTab(Tab.SLOT)
							loadSlots()
						}}
					>
						<Text style={selectedTab === Tab.SLOT && {color: 'white'}}>Search Slots</Text>
					</Pressable>
				</View>
				{selectedTab === Tab.ITEM &&
					<TextInput 
					placeholder="Enter Item ID..."
					placeholderTextColor={"grey"}
					style={styles.searchBar} 
					onChangeText={(value) => {
						searchItems(value)
					}}
				/>}
				{selectedTab === Tab.SLOT &&
					<TextInput 
					placeholder="Enter Slot ID..."
					placeholderTextColor={"grey"}
					style={styles.searchBar} 
					onChangeText={(value) => {
						searchSlots(value)
					}}
				/>}
			</View>
			{selectedTab === Tab.ITEM &&
				<FlatList 
				style={styles.list}
					data={filteredItems} 
					renderItem={({item}) => (
						<Link href={{
							pathname: '/item/[id]',
							params: {id: item}
						}}
						style={styles.listItem}>
							<Text style={styles.linkText}>
								{item}
							</Text>
						</Link>
					)}
				></FlatList>
			}
			{selectedTab === Tab.SLOT &&
				<FlatList 
				style={styles.list}
					data={filteredSlots} 
					renderItem={({item}) => (
						<Link href={{
							pathname: '/slot/[id]',
							params: {id: item}
						}}
						style={styles.listItem}>
							<Text style={styles.linkText}>
								{item}
							</Text>
						</Link>
					)}
				></FlatList>
			}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		display: "flex",
		width: '65%',
		flex: 1,
		alignContent: "center",
		alignItems: "center",
		alignSelf: 'center',
	},
	searchBarContainer: {
		display: 'flex',
		width: "100%",
		height: "20%",
		minHeight: 30,
		margin: 60,
	},
	tabContainer: {
		display: 'flex',
		height: "100%",
		width: "100%",
		borderColor: '#25292e',
		borderWidth: 3,
		borderTopRightRadius: 16,
		borderTopLeftRadius: 16,
		flexDirection: "row",
		flex: 2
	},
	tab: {
		display: 'flex',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		borderRightWidth: 3,
		borderTopLeftRadius: 16,
		borderColor: '#25292e'
	},
	finalTab: {
		borderRightWidth: 0,
		borderTopLeftRadius: 0,
		borderTopRightRadius: 10,
	},
	activeTab: {
		borderColor: '#25292e',
		backgroundColor: '#25292e',
		display: 'flex',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		borderRightWidth: 3,
		color: "white",
		borderTopLeftRadius: 10,
	},
	searchBar: {
		width: "100%",
		backgroundColor: '#e3edf9',
		borderWidth: 3,
		borderRadius: 16,
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
		borderColor: '#25292e',
		paddingHorizontal: 10,
		marginBottom: 25,
		marginTop: -3,
		flex: 2
	},
	list: {
		width: "60%"
	},
	listItem: {
		display: "flex",
		width: "100%",
		height: 60,
		backgroundColor: '#cfd7e1',
		borderColor: '#25292e',
		borderWidth: 3,
		paddingHorizontal: 10,
		marginBottom: 2,
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		textAlignVertical: "center",
		borderRadius: 12,
	},
	linkText: {
		fontSize: 20,
		fontWeight: "bold"
	}
})