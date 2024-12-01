import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  AppState,
} from 'react-native';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {RootStackParamList} from '../navigation/RootStackParams';
import {TabParamList} from '../navigation/TabParamList';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Bar as ProgressBar} from 'react-native-progress';
import {TabView, TabBar} from 'react-native-tab-view';
import {LineChart} from 'react-native-chart-kit';
import {useOrderStore} from '../store/useOrderStore';
import {useLocationStore} from '../store/useLocationStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  startUpdates,
  stopUpdates,
  queryPedometerData,
  type CMPedometerData,
} from '@sfcivictech/react-native-cm-pedometer';
import { useVolumeStore } from '../store/useVolumeStore';


type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

const {width} = Dimensions.get('window');

const DashboardScreen: React.FC<Props> = ({navigation}) => {
  const [index, setIndex] = useState(0);
  const [dailyStepsData, setDailyStepsData] = useState<number[]>([]);
  const [monthlyStepsData, setMonthlyStepsData] = useState<number[]>([]);
  const [yearlyStepsData, setYearlyStepsData] = useState<number[]>([]);
  const [totalStepsToday, setTotalStepsToday] = useState<number>(0);
  const [routes] = useState([
    {key: 'daily', title: 'Daily'},
    {key: 'monthly', title: 'Monthly'},
    {key: 'yearly', title: 'Yearly'},
  ]);

  const currentOrder = useOrderStore(state => state.currentOrder);
  const location = useLocationStore(state => state.location);
  const [distanceLeft, setDistanceLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [fullDistance, setFullDistance] = useState<number>(0);

  const [error, setError] = useState<Error | undefined>();
  const { isMuted, toggleMute } = useVolumeStore();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);


  



  useEffect(() => {
    fetchStepsData();
    initializeSteps();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        queryPedometerData(startOfToday, new Date())
          .then(data => setTotalStepsToday(data.numberOfSteps))
          .catch(error =>
            console.error('Error fetching steps on app focus:', error),
          );
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeSteps = async () => {
    try {
      const data = await queryPedometerData(startOfToday, new Date());
      setTotalStepsToday(data.numberOfSteps);
    } catch (error) {
      console.error('Error fetching initial steps:', error);
    }
  };

  useEffect(() => {
    startUpdates(startOfToday, (newError, newData) => {
      setError(newError);
      if (newError) {
        console.error(newError);
      } else if (newData) {
        setTotalStepsToday(newData.numberOfSteps);
      }
    });

    return () => {
      stopUpdates();
    };
  }, []);

  const fetchStepsData = async () => {
    try {
      const dailyData = await getStepsDataForLastNDays(7);
      setDailyStepsData(dailyData);
      await AsyncStorage.setItem('dailyStepsData', JSON.stringify(dailyData));

      const monthlyData = await getStepsDataForLastNWeeks(4);
      setMonthlyStepsData(monthlyData);
      await AsyncStorage.setItem(
        'monthlyStepsData',
        JSON.stringify(monthlyData),
      );

      const yearlyData = await getStepsDataForLastNMonths(12);
      setYearlyStepsData(yearlyData);
      await AsyncStorage.setItem('yearlyStepsData', JSON.stringify(yearlyData));
    } catch (error) {
      console.error('Error fetching steps data:', error);
      // Load data from AsyncStorage in case of error
      const dailyData = await AsyncStorage.getItem('dailyStepsData');
      const monthlyData = await AsyncStorage.getItem('monthlyStepsData');
      const yearlyData = await AsyncStorage.getItem('yearlyStepsData');

      if (dailyData) setDailyStepsData(JSON.parse(dailyData));
      if (monthlyData) setMonthlyStepsData(JSON.parse(monthlyData));
      if (yearlyData) setYearlyStepsData(JSON.parse(yearlyData));
    }
  };

  const getStepsBetweenDates = (
    startDate: Date,
    endDate: Date,
  ): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      queryPedometerData(startDate, endDate)
        .then(data => {
          resolve(data.numberOfSteps);
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  const getStepsDataForLastNDays = async (n: number) => {
    const stepsData = [];
    for (let i = n - 1; i >= 0; i--) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - i);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const steps = await getStepsBetweenDates(startDate, endDate);
      stepsData.push(steps);
    }
    return stepsData;
  };

  const getStepsDataForLastNWeeks = async (n: number) => {
    const stepsData = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week

    for (let i = n - 1; i >= 0; i--) {
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - i * 7);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      const steps = await getStepsBetweenDates(startDate, endDate);
      stepsData.push(steps);
    }
    return stepsData;
  };

  const getStepsDataForLastNMonths = async (n: number) => {
    const stepsData = [];
    const currentDate = new Date();
    currentDate.setDate(1); // Start of the month

    for (let i = n - 1; i >= 0; i--) {
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const steps = await getStepsBetweenDates(startDate, endDate);
      stepsData.push(steps);
    }
    return stepsData;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      const distanceInMeters = distance * 1000;
      return `${Math.round(distanceInMeters)} meters`;
    }
    return `${distance.toFixed(2)} kilometers`;
  };

  useEffect(() => {
    if (!currentOrder) {
      setDistanceLeft(0);
      setFullDistance(0);
      setProgress(0);
      return;
    }

    if (location && currentOrder.customerLocation) {
      const rawDistance = calculateDistance(
        location.latitude,
        location.longitude,
        currentOrder.customerLocation.latitude,
        currentOrder.customerLocation.longitude,
      );

      setDistanceLeft(rawDistance);

      if (currentOrder.startLocation) {
        const totalDistance = calculateDistance(
          currentOrder.startLocation.latitude,
          currentOrder.startLocation.longitude,
          currentOrder.customerLocation.latitude,
          currentOrder.customerLocation.longitude,
        );

        const progress =
          totalDistance > 0 ? (totalDistance - rawDistance) / totalDistance : 0;

        setFullDistance(totalDistance);
        setProgress(progress > 0 ? progress : 0);
      } else {
        console.warn('Start location is not defined for the current order.');
        setProgress(0);
      }
    }
  }, [location, currentOrder]);

  const renderScene = ({route}: {route: {key: string}}) => {
    switch (route.key) {
      case 'daily':
        return (
          <StatsRoute
            labels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
            data={dailyStepsData}
          />
        );
      case 'monthly':
        return (
          <StatsRoute
            labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
            data={monthlyStepsData}
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
            data={yearlyStepsData}
          />
        );
      default:
        return null;
    }
  };

  const currentDate = new Date().toLocaleDateString();

  return (
    <>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('OptionScreen')}>
            <Icon
              name="cog"
              size={32}
              color="#E74C3C"
              style={styles.optionsIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMute} style={styles.volumeContainer}>
            <Icon
              name={isMuted ? 'volume-off' : 'volume-up'}
              size={32}
              color="#E74C3C"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.dateText}>{currentDate}</Text>
        <View style={styles.runnerSection}>
          <Image
            source={require('../assets/images/pizzaDash.png')}
            style={styles.runnerImage}
          />
          <View style={styles.runnerTextContainer}>
            {currentOrder ? (
              <>
                <Text style={styles.almostThereText}>
                  Hurry! Start the delivery
                </Text>
                <Text style={styles.distanceText}>
                  Distance left to complete the delivery 🍕
                </Text>
                <Text style={styles.kilometersText}>
                  {formatDistance(distanceLeft)}
                </Text>
                <ProgressBar
                  progress={progress}
                  width={width * 0.5}
                  color="#E74C3C"
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {`${
                    fullDistance - distanceLeft <= 0
                      ? '0'
                      : formatDistance(fullDistance - distanceLeft)
                  } / ${formatDistance(fullDistance)}`}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.noOrderHeader}>No Active Deliveries</Text>
                <Text style={styles.stepCountText}>
                  Total Steps Today: {totalStepsToday}
                </Text>
                <Text style={styles.noOrderSubtext}>
                  You're all caught up! Ready to start a new delivery?
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.bottomHeader}>Your Steps Progress</Text>
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{width: width}}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={{backgroundColor: '#E74C3C'}}
              style={{backgroundColor: 'white'}}
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

const StatsRoute: React.FC<StatsRouteProps> = ({labels, data}) => {
  if (data.length === 0) {
    return (
      <View style={styles.tabScene}>
        <Text>No data available.</Text>
      </View>
    );
  }
  const average = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
  const best = Math.max(...data);

  return (
    <View style={styles.tabScene}>
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsLabel}>Average</Text>
          <Text style={styles.statsValue}>
            <Text style={styles.statsNumber}>{average}</Text>
            <Text style={styles.statsUnit}> steps</Text>
          </Text>
        </View>
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
  optionsIcon: {
    padding: 10,
  },

  noOrderHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    textAlign: 'center',
  },
  noOrderSubtext: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  stepCountText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
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
  // profileImage: {
  //   width: 60,
  //   height: 60,
  //   borderRadius: 30,
  // },
  moneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeContainer: {
    padding: 10,
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
