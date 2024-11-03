import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/RootStackParams';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/FontAwesome';

type LandingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Landing'
>;

type Props = {
  navigation: LandingScreenNavigationProp;
};

const {width} = Dimensions.get('window');

const LandingScreen: React.FC<Props> = ({navigation}) => {
  return (
    <ImageBackground
      source={require('../assets/images/background2.png')} // <-- Set your background image here
      style={styles.backgroundImage} // Apply styles
    >
      <View style={styles.container}>
        {/* Game Name */}
        <Image
          source={require('../assets/images/pizzaDash.png')}
          style={styles.pizzaImage}
        />

        {/* Play Button */}
        <Animatable.View animation="pulse" iterationCount="infinite">
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => navigation.navigate('Main')}>
            <Icon name="play" size={80} color="#FFFFFF" />
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1, // Full-screen background
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  gameName: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#E74C3C',
    fontFamily: 'Cochin',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  
  pizzaImage: {
    width: 430, // Increased from 200 to 250
    height: 265, // Increased from 200 to 250
    marginTop: 60,
    marginBottom: 30,
  },
  playButton: {
    width: width * 0.42, // Adjusted size
    height: width * 0.42,
    borderRadius: (width * 0.5) / 2,
    backgroundColor: '#E74C3C', // Pepperoni color
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Adds shadow on Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 2}, // Shadow for iOS
    shadowOpacity: 0.25, // Shadow for iOS
    shadowRadius: 3.84, // Shadow for iOS
  },
  playButtonText: {
    fontSize: width * 0.1, // Adjusted font size
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default LandingScreen;
