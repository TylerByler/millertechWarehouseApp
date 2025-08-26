import { Stack } from "expo-router";
import { View } from "react-native";

export default function Map() {
	return (
		<View>
			<Stack.Screen 
			options={{ 
				title: 'Map',
				headerStyle: {
				backgroundColor: '#25292e',
				},
				headerTintColor: '#fff',
			}}/>
		</View>
	)
}