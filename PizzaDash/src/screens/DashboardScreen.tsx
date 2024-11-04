  import React from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
  } from 'react-native';
  import { CompositeNavigationProp } from '@react-navigation/native';
  import { StackNavigationProp } from '@react-navigation/stack';
  import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
  import { RootStackParamList } from '../navigation/RootStackParams';
  import { TabParamList } from '../navigation/TabParamList';
  import Icon from 'react-native-vector-icons/FontAwesome';
  import { Bar as ProgressBar } from 'react-native-progress';
  import { TabView, TabBar } from 'react-native-tab-view';
  import { LineChart } from 'react-native-chart-kit';

  type DashboardScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Dashboard'>,
    StackNavigationProp<RootStackParamList>
  >;

  type Props = {
    navigation: DashboardScreenNavigationProp;
  };

  const { width } = Dimensions.get('window');

  const DashboardScreen: React.FC<Props> = ({ navigation }) => {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
      { key: 'daily', title: 'Daily' },
      { key: 'monthly', title: 'Monthly' },
      { key: 'yearly', title: 'Yearly' },
    ]);

    const dailyData = [8000, 9000, 7500, 10000, 8500, 9500, 12000];
    const monthlyData = [7500, 8000, 8500, 9000];
    const yearlyData = [
      7000, 7500, 8000, 8500, 9000, 9500, 10000, 9500, 9000, 8500, 8000, 7500,
    ];
    const mockUserData = {
      totalEarnings: 1234,
      totalDistance: 15, // Total distance to complete the delivery
      distanceCovered: 8, // Distance already covered
    };

    const distanceLeft =
      mockUserData.totalDistance - mockUserData.distanceCovered;
    const progress = mockUserData.distanceCovered / mockUserData.totalDistance;

    const renderScene = ({ route }: { route: { key: string } }) => {
      switch (route.key) {
        case 'daily':
          return (
            <StatsRoute
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
              data={dailyData}
            />
          );
        case 'monthly':
          return (
            <StatsRoute
              labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
              data={monthlyData}
            />
          );
        case 'yearly':
          return (
            <StatsRoute
              labels={[
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ]}
              data={yearlyData}
            />
          );
        default:
          return null;
      }
    };

    const currentDate = new Date().toLocaleDateString();

    return (
      <>
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Image
                source={require('../assets/images/pizzaDash.png')}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <View style={styles.moneyContainer}>
              <Icon name="money" size={24} color="#E74C3C" />
              <Text style={styles.moneyText}>${mockUserData.totalEarnings}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>{currentDate}</Text>
          {/* Runner Section */}
          <View style={styles.runnerSection}>
            <Image
              source={require('../assets/images/pizzaDash.png')}
              style={styles.runnerImage}
            />
            <View style={styles.runnerTextContainer}>
              <Text style={styles.almostThereText}>You’re almost there!</Text>
              <Text style={styles.distanceText}>
                Distance left to complete the delivery 🍕
              </Text>
              <Text style={styles.kilometersText}>
                {distanceLeft} kilometers
              </Text>
              <ProgressBar
                progress={progress}
                width={width * 0.5}
                color="#E74C3C"
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {mockUserData.distanceCovered} km / {mockUserData.totalDistance} km
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomHeader}>Your Steps Progress</Text>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: width }}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: '#E74C3C' }}
                style={{ backgroundColor: 'white' }}
                activeColor="#E74C3C"
                inactiveColor="gray"
              />
            )}
          />
        </View>
      </>
    );
  };

  type StatsRouteProps = {
    labels: string[];
    data: number[];
  };

  const StatsRoute: React.FC<StatsRouteProps> = ({ labels, data }) => {
    const average = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
    const best = Math.max(...data);

    return (
      <View style={styles.tabScene}>
        <View style={styles.statsContainer}>
          {/* Average */}
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Average</Text>
            <Text style={styles.statsValue}>
              <Text style={styles.statsNumber}>{average}</Text>
              <Text style={styles.statsUnit}> steps</Text>
            </Text>
          </View>
          {/* Best */}
          <View style={styles.statsItem}>
            <Text style={styles.statsLabel}>Best</Text>
            <Text style={styles.statsValue}>
              <Text style={styles.statsNumber}>{best}</Text>
              <Text style={styles.statsUnit}> steps</Text>
            </Text>
          </View>
        </View>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=" steps"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            paddingRight: 85,
          }}
        />
      </View>
    );
  };



  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    topSection: {
      paddingHorizontal: 20,
      paddingTop: 40,
      backgroundColor: '#f2f2f2',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    profileImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    moneyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    moneyText: {
      marginLeft: 5,
      fontSize: 18,
      color: '#E74C3C',
    },
    dateText: {
      marginTop: 10,
      fontSize: 16,
      color: 'gray',
    },
    runnerSection: {
      flexDirection: 'row',
      marginTop: 20,
    },
    runnerImage: {
      width: 100,
      height: 100,
    },
    runnerTextContainer: {
      flex: 1,
      marginLeft: 20,
      justifyContent: 'center',
    },
    almostThereText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#E74C3C',
    },
    distanceText: {
      fontSize: 16,
      color: 'gray',
      marginTop: 5,
    },
    kilometersText: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 10,
    },
    progressBar: {
      marginTop: 10,
    },
    progressText: {
      fontSize: 14,
      color: 'gray',
      marginTop: 5,
    },
    bottomSection: {
      paddingTop: 30,
      marginTop: 30,
      paddingHorizontal: 20,
      flex: 1,
      backgroundColor: 'white',
    },
    bottomHeader: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 20,
      marginBottom: 10,
    },
    statsItem: {
      alignItems: 'center',
    },
    statsLabel: {
      fontSize: 16,
      color: 'gray',
    },
    statsValue: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    statsNumber: {
      fontSize: 24,
      color: 'black',
    },
    statsUnit: {
      fontSize: 16,
      color: 'gray',
      marginLeft: 5,
      marginBottom: 2,
    },
    tabScene: {
      flex: 1,
      paddingTop: 20,
    },
    graphPlaceholder: {
      marginTop: 20,
      width: '100%',
      height: 200,
      backgroundColor: '#e0e0e0',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  export default DashboardScreen;
