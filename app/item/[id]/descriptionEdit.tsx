import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function ItemDescriptionEdit() {
	const { id } = useLocalSearchParams()
	const database = useSQLiteContext()
	const [desc, setDesc] = useState<string>("")
	
	const loadData = async () => {
		try {
		const itemResult = await database.getAllAsync<string>("SELECT * FROM items WHERE id = '" + id + "';");
		console.log(itemResult)
		setDesc(itemResult[0])
		} catch(e) {
			console.log(e);
		}
	}

	useEffect(() => {
		console.log("Desc: \n" + desc)
	}, [desc])

	const submitDescToDB = async () => {
		try {
		console.log("Submitting new description to database")
		await database.execAsync("UPDATE items SET description = '" + desc + "' WHERE id = '" + id + "';")
		router.back()
		} catch(e) {
			console.log(e)
			router.back()
		}
	}

	useFocusEffect(
			useCallback(() => {
				if (database) {
					loadData();
				}
			}, [database])
		)

	return (
		<>
			<Stack.Screen 
			options={{ 
				title: 'Item Description Edit',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
			<View style={styles.pageContainer}>
				<View style={styles.itemContainer}>
					<View style={styles.descriptionLabel}>
						<Text style={styles.descriptionLabelText}>Description for Item #{id}</Text>
					</View>
					<TextInput 
						style={styles.description} 
						multiline={true} 
						autoCorrect={false} 
						onChangeText={(value) => setDesc(value)}
					/>
					<Pressable style={styles.submitButton} onPress={() => submitDescToDB()}>
						<Text style={styles.submitButtonText}>Submit</Text>
					</Pressable>
				</View>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	pageContainer: {
		flex: 1,
		alignSelf: "center",
		width: "85%",
		marginTop: 90,
		alignContent: "center",
	},
	itemContainer: {
		height: 500,
		alignContent: "center",
		alignItems: "center",
		justifyContent: "center",
	},
	descriptionLabel: {
		flex: 1,
		borderColor: "#25292e",
		backgroundColor: "#25292e",
		borderTopRightRadius: 16,
		borderTopLeftRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		textAlignVertical: "center",
		width: "100%",
	},
	description: {
		flex: 4,
		width: "100%",
		borderWidth: 4,
		borderColor: "#25292e",
		borderBottomLeftRadius: 16,
		borderBottomRightRadius: 16,
		textAlign: "left",
		textAlignVertical: "top",
	},
	descriptionLabelText: {
		fontWeight: "bold",
		fontSize: 40, 
		color: "white",
	},
	submitButton: {
		flex: 1,
		aspectRatio: 3,
		backgroundColor:"#25292e",
		marginTop: 30,
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center"
	},
	submitButtonText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff"
	},
})