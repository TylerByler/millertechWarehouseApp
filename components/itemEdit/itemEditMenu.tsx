import { STATUS } from "@/assets/types/STATUS"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { useEffect, useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"

type Props = {
	isModalVisible: boolean | undefined,
	itemIndex: number,
	item: {id: string, quantity: number, status: STATUS, isOgItem: boolean},
	ogQuantity: number
	onCloseEditItem: () => void,
	onSubmit: (itemIndex: number, updatedItemQuantity: number) => void
}

export default function ItemEditMenu({isModalVisible, itemIndex, item, ogQuantity, onCloseEditItem, onSubmit}: Props) {
	const [thisItem, setThisItem] = useState<{id: string, quantity: number, status: STATUS, isOgItem: boolean}>({id: "", quantity: -1, status: STATUS.NORMAL, isOgItem: false})
	const [updatedItemQuantity, setUpdatedItemQuantity] = useState<number>(0)
	const [previousQuantity, setPreviousQuantity] = useState<number>(0)

	useEffect(() => {
		console.log("itemEditMenu: Item Loaded Into Props")
		console.log(item)
	}, [isModalVisible])

	useEffect(() => {
		if (item !== undefined){
			console.log("itemEditMenu: Item Loaded From Props")
			setThisItem({id: item.id, quantity: item.quantity, status: item.status, isOgItem: item.isOgItem})
			setPreviousQuantity(ogQuantity)
		}
			console.log("itemEditMenu: Item Failed to Load From Props")
	},[item])

	const SubmitButton = () => (
		<Pressable
		style={styles.submitButton}
		onPress={() => {
			onSubmit(itemIndex, updatedItemQuantity)
			onCloseEditItem()
		}}
		>
			<Text style={styles.submitButtonText}>Submit</Text>
		</Pressable>
	)
	return (
		<View style={styles.modalContainer}>
			<View style={styles.editModalBox}>
				<View style={styles.exitButtonContainer}>
					<Pressable style={styles.exitButton} onPress={onCloseEditItem}>
						<MaterialIcons name="close" color="#25292e" size={30} />
					</Pressable>
				</View>
				<View style={styles.editBoxContent}>
					<View style={styles.editItemBox}>
						<View style={styles.itemLabel}>
							<Text style={styles.searchBarTitleText}>
								Edit Slot {thisItem.id !== undefined ? thisItem.id : "N/A"}
							</Text>
						</View>
						<TextInput 
							style={styles.editItemTextboxContainer}
							placeholder={previousQuantity.toString()}
							placeholderTextColor={"grey"}
							onChangeText={(value) => {
							setUpdatedItemQuantity(parseInt(value))
						}}
						></TextInput>
					</View>
					<SubmitButton></SubmitButton>
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
	editItemBox: {
		width: "80%",
		flex: 0.8,
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
	itemLabel: {
		flex: 1,
		backgroundColor: "#25292e",
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	editItemTextboxContainer: {
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