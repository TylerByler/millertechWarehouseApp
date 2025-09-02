import * as FileSystem from "expo-file-system";
import { Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Settings() {

	const database = useSQLiteContext()

	const saveDBtoExternalFile = async () => {
		try {
			const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
			if (!permissions.granted) {
				return
			}

			const uri = permissions.directoryUri;

			const publicFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
				uri,
				'data.db',
				'application/x-sqlite3'
			);

			const fileContent = await FileSystem.readAsStringAsync(`file:///${database.databasePath}`, {
				encoding: FileSystem.EncodingType.Base64,
			});

			await FileSystem.writeAsStringAsync(publicFileUri, fileContent, {
				encoding: FileSystem.EncodingType.Base64,
			});

			console.log('File successfully copied to the public Documents folder.');
		} catch(e) {
			console.log(e)
		}
	}

	return (
		<View style={style.container}>
			<Stack.Screen 
			options={{ 
				title: 'Settings',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
			<Pressable style={style.button} onPress={() => saveDBtoExternalFile()}>
				<Text style={style.buttonText}>Save DB</Text>
			</Pressable>
		</View>
	)
}

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignContent: "center",
		alignItems: "center",
		justifyContent: "center",
	},
	button: {
		backgroundColor: "#25292e",
		borderRadius: 16,
		height: 200,
		width: 200,
		textAlign: "center",
		textAlignVertical: "center",
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		 color: "white",
    fontSize: 20,
    fontWeight: "bold",
	}
})