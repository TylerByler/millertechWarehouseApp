import { Href, Link } from "expo-router";
import { Pressable, StyleProp, StyleSheet, Text } from "react-native";

type Props = {
	style?: StyleProp<any>,
	text?: string,
	href?: Href
	onPress?: () => void
}

export default function SlabButton({style, text, href, onPress}: Props) {

	if (href) {
		return (
			<Link href={href} style={[styles.container, style]} onPress={onPress}>
				<Text style={styles.font}>{text}</Text>
			</Link>
		)
	} else {
		return (
			<Pressable style={[styles.container, style]} onPress={onPress}>
				<Text style={styles.font}>{text}</Text>
			</Pressable>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		display: "flex",
		flexDirection: "row",
		aspectRatio: 1,
		maxWidth: 420,
		minWidth: 300,
		backgroundColor: '#25292e',
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		alignContent: "center",
		textAlign: "center", 
		textAlignVertical: "center"
	},
	font: {
		fontSize: 25,
		fontFamily: "Sans-Serif",
		fontWeight: "bold",
		color: "#fff",
	}
})