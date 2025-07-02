import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = PropsWithChildren<{
	title: string;
	isVisible: boolean;
	onClose: () => void;
}>

export default function EditModal({title, isVisible, children, onClose}: Props) {
	return (
		<View>
			<Modal animationType="slide" transparent={false} visible={isVisible}>
				<View style={styles.modalContents}>
					<View style={styles.modalTopBar}>
						<Pressable 
						style={styles.exitButton} 
						onPress={() => {
							onClose()
						}}>
							<MaterialIcons name="close" color="#fff" size={40} />
						</Pressable>
						<View style={styles.modalTitleContainer}>
							<Text style={styles.modalTitle}>{title}</Text>
						</View>
					</View>
					<View style={styles.dynamicContentContainer}>
						{children}
					</View>
				</View>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	modalContents: {
		flex: 1
	},
	exitButton: {
		height: "100%",
		marginLeft: 10,
		justifyContent: "center",
		alignContent: "center",
		zIndex: 1,
		position: "absolute"
	},
	modalTopBar: {
		width: "100%",
		flexDirection: "row",
		height: 60,
		backgroundColor: "#25292e",
		alignContent: "center"
	},
	modalTitleContainer: {
		display: "flex",
		flexDirection: "column",
		zIndex: -1,
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		textAlignVertical: "center",
	},
	modalTitle: {
		fontSize: 30,
		fontWeight: "bold",
		color: "white"
	},
	dynamicContentContainer: {
		display: "flex",
		flex: 1,
		flexDirection: "column",
		alignItems: "center",
	}
})