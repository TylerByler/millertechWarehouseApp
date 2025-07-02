import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"

type Props = {
	index: number,
	ids: string[],
	quantities: number[],
	onCloseEditSlot: () => void,
	onSaveSlot: (value: number) => void
}

export default function EditMenu({index, ids, quantities, onCloseEditSlot, onSaveSlot}: Props) {
	const [updatedSlotQuantity, setUpdatedSlotQuantity] = useState<number>(0)
	return (
		<View style={styles.modalContainer}>
			<View style={styles.editModalBox}>
				<View style={styles.exitButtonContainer}>
					<Pressable style={styles.exitButton} onPress={onCloseEditSlot}>
						<MaterialIcons name="close" color="#25292e" size={30} />
					</Pressable>
				</View>
				<View style={styles.editBoxContent}>
					<View style={styles.editSlotBox}>
						<View style={styles.slotLabel}>
							<Text style={styles.searchBarTitleText}>
								Edit Slot {ids[index]}
							</Text>
						</View>
						<TextInput 
						style={styles.editSlotTextboxContainer}
						placeholder={quantities[index] !== undefined ? quantities[index].toString() : "N/A"}
						placeholderTextColor={"grey"}
						onChangeText={(value) => {
							setUpdatedSlotQuantity(parseInt(value))
						}}
						onChange={() => console.log("Refreshed")}
						></TextInput>
					</View>
					<Pressable 
					style={styles.submitButton} 
					onPress={() => {
						onSaveSlot(updatedSlotQuantity)}
					}>
						<Text style={styles.submitButtonText}>Submit</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "center", 
		alignItems: "center",
		backgroundColor: '#00000099',
	},
	editModalBox: {
		width: "50%",
		height: "40%",
		borderWidth: 4,
		borderColor: "#25292e",
		backgroundColor: '#fff',
		borderRadius: 16,
	},
	editBoxContent: {
		flex: 9,
		justifyContent: "center",
		alignItems: "center"
	},
	exitButtonContainer: {
		flex: 1
	},
	exitButton: {
		marginLeft: 3,
		justifyContent: "center",
		alignContent: "center",
		zIndex: 1,
		position: "absolute",
	},
	editSlotBox: {
		width: "80%",
		height: "30%",
		borderWidth: 4,
		borderColor: "#25292e",
		borderRadius: 16
	},
	submitButton: {
		width: 120,
		height: 40,
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
	slotLabel: {
		flex: 1,
		backgroundColor: "#25292e",
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	editSlotTextboxContainer: {
		flex: 1,
		textAlign: "center",
		textAlignVertical: "center",
		fontSize: 20,
	},
	searchBarTitleText: {
		fontSize: 30,
		fontWeight: "bold",
		color: "white"
	},
})