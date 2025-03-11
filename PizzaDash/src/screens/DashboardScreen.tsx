import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  AppState,
  Alert,
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
import {useCurrencyStore} from '../store/useCurrencyStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  startUpdates,
  stopUpdates,
  queryPedometerData,
  type CMPedometerData,
} from '@sfcivictech/react-native-cm-pedometer';
import {useVolumeStore} from '../store/useVolumeStore';
import LevelDisplay from '../components/LevelDisplay';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useExperienceStore} from '../store/useExperienceStore';
import Clipboard from '@react-native-clipboard/clipboard';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: DashboardScreenNavigationProp;
};

const {width} = Dimensions.get('window');

// Interface for storing daily records persistently.
interface DailyRecord {
  date: string; // Format: "YYYY-MM-DD"
  steps: number;
}

const DashboardScreen: React.FC<Props> = ({navigation}) => {
  const [index, setIndex] = useState(0);
  // Daily API data for the last 7 days.
  const [dailyStepsData, setDailyStepsData] = useState<number[]>([]);
  // Aggregated values computed from persistent history.
  const [monthlyStepsData, setMonthlyStepsData] = useState<number[]>([]);
  const [yearlyStepsData, setYearlyStepsData] = useState<number[]>([]);
  const [totalStepsToday, setTotalStepsToday] = useState<number>(0);
  const [routes] = useState([
    {key: 'daily', title: 'Daily'},
    {key: 'monthly', title: 'Monthly'},
    {key: 'yearly', title: 'Yearly'},
  ]);

  // Persistent daily history.
  const [dailyHistory, setDailyHistory] = useState<DailyRecord[]>([]);
  const currentOrder = useOrderStore(state => state.currentOrder);
  const location = useLocationStore(state => state.location);
  const [distanceLeft, setDistanceLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [fullDistance, setFullDistance] = useState<number>(0);

  const [error, setError] = useState<Error | undefined>();
  const {isMuted, toggleMute} = useVolumeStore();
  const balance = useCurrencyStore(state => state.balance);
  const level = useExperienceStore(state => state.level);
  const experience = useExperienceStore(state => state.experience);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // ----------------------------
  // Helper Functions for Persistence & Aggregation
  // ----------------------------

  // Update or add today's step count to persistent history.
  const updateDailyHistory = async (todaySteps: number) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem('dailyHistory');
      let history: DailyRecord[] = stored ? JSON.parse(stored) : [];
      const existingIndex = history.findIndex(entry => entry.date === todayStr);
      if (existingIndex !== -1) {
        history[existingIndex].steps = todaySteps;
      } else {
        history.push({date: todayStr, steps: todaySteps});
      }
      // Sort history chronologically.
      history.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      await AsyncStorage.setItem('dailyHistory', JSON.stringify(history));
      setDailyHistory(history);
      computeAggregates(history);
    } catch (err) {
      console.error('Error updating daily history:', err);
    }
  };

  // Compute aggregates for monthly (weekly aggregates) and yearly (monthly aggregates).
  const computeAggregates = (history: DailyRecord[]) => {
    setMonthlyStepsData(computeWeeklyAggregates(history));
    setYearlyStepsData(computeMonthlyAggregates(history));
  };

  // Compute weekly aggregates for the last 4 weeks.
  const computeWeeklyAggregates = (history: DailyRecord[]): number[] => {
    const weeks: number[] = [];
    const today = new Date();
    // Assume week starts on Sunday.
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      let sum = 0;
      history.forEach(item => {
        const d = new Date(item.date);
        if (d >= weekStart && d <= weekEnd) {
          sum += item.steps;
        }
      });
      weeks.push(sum);
    }
    return weeks;
  };

  // Compute monthly aggregates for the current calendar year.
  const computeMonthlyAggregates = (history: DailyRecord[]): number[] => {
    const months: number[] = [];
    const currentYear = new Date().getFullYear();
    for (let m = 0; m < 12; m++) {
      let sum = 0;
      history.forEach(item => {
        const date = new Date(item.date);
        if (date.getFullYear() === currentYear && date.getMonth() === m) {
          sum += item.steps;
        }
      });
      months.push(sum);
    }
    return months;
  };

  // Load persistent daily history and compute aggregates.
  const loadHistoryAggregates = async () => {
    try {
      const stored = await AsyncStorage.getItem('dailyHistory');
      const history: DailyRecord[] = stored ? JSON.parse(stored) : [];
      setDailyHistory(history);
      computeAggregates(history);
    } catch (err) {
      console.error('Error loading daily history:', err);
    }
  };

  // ----------------------------
  // End Helper Functions
  // ----------------------------

  useEffect(() => {
    loadHistoryAggregates();
    fetchStepsData();
    initializeSteps();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        queryPedometerData(startOfToday, new Date())
          .then(data => {
            setTotalStepsToday(data.numberOfSteps);
            updateDailyHistory(data.numberOfSteps);
          })
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
      updateDailyHistory(data.numberOfSteps);
    } catch (error) {
      console.error('Error fetching initial steps:', error);
    }
  };

  // For daily steps, we continue using the API for the last 7 days.
  const fetchStepsData = async () => {
    try {
      const dailyData = await getStepsDataForLastNDays(7);
      setDailyStepsData(dailyData);
      await AsyncStorage.setItem('dailyStepsData', JSON.stringify(dailyData));
    } catch (error) {
      console.error('Error fetching daily steps data:', error);
      const stored = await AsyncStorage.getItem('dailyStepsData');
      if (stored) setDailyStepsData(JSON.parse(stored));
    }
  };

  const getStepsBetweenDates = (
    startDate: Date,
    endDate: Date,
  ): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      queryPedometerData(startDate, endDate)
        .then(data => resolve(data.numberOfSteps))
        .catch(error => reject(error));
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
    return R * c;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      const meters = distance * 1000;
      return `${Math.round(meters)} meters`;
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
        const prog =
          totalDistance > 0 ? (totalDistance - rawDistance) / totalDistance : 0;
        setFullDistance(totalDistance);
        setProgress(prog > 0 ? prog : 0);
      } else {
        console.warn('Start location is not defined for the current order.');
        setProgress(0);
      }
    }
  }, [location, currentOrder]);

  // Realtime updates: subscribe to continuous pedometer updates.
  useEffect(() => {
    startUpdates(startOfToday, (newError, newData) => {
      setError(newError);
      if (newError) {
        console.error(newError);
      } else if (newData) {
        const steps = newData.numberOfSteps;
        setTotalStepsToday(steps);
        updateDailyHistory(steps);
        // Also update dailyStepsData: assume the last element corresponds to today.
        setDailyStepsData(prev => {
          const newArr = [...prev];
          if (newArr.length > 0) {
            newArr[newArr.length - 1] = steps;
          }
          return newArr;
        });
      }
    });
    return () => {
      stopUpdates();
    };
  }, []);

  // Export function: copy aggregated data to clipboard.
  const exportData = async () => {
    try {
      const exportJson = {
        timestamp: new Date().toISOString(),
        // dailyStepsData,
        stepsLastSevenDays: dailyStepsData,
        totalStepsToday,
        level,
        experience,
        balance,
        distanceLeft,
        progress,
      };
      Clipboard.setString(JSON.stringify(exportJson, null, 2));
      Alert.alert('Export Successful', 'User data copied to clipboard.');
    } catch (err) {
      Alert.alert('Export Failed', 'There was an error exporting user data.');
    }
  };

  const getLastNDaysLabels = (n: number): string[] => {
    const labels: string[] = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      labels.push(day.toLocaleString('en-US', {weekday: 'short'}));
    }
    return labels;
  };

  // Render the scene based on the active tab.
  const renderScene = ({route}: {route: {key: string}}) => {
    switch (route.key) {
      case 'daily':
        return (
          <StatsRoute labels={getLastNDaysLabels(7)} data={dailyStepsData} />
        );
      case 'monthly':
        // Require at least 7 days of history for monthly aggregates.
        if (dailyHistory.length < 7) {
          return (
            <View style={styles.noDataContainer}>
              <Icon name="info-circle" size={24} color="#E74C3C" />
              <Text style={styles.noDataText}>
                Insufficient data for monthly view. Please use the app for at
                least a week.
              </Text>
            </View>
          );
        }
        return (
          <StatsRoute
            labels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
            data={monthlyStepsData}
          />
        );
      case 'yearly':
        // Require at least 30 days of history for yearly aggregates.
        if (dailyHistory.length < 30) {
          return (
            <View style={styles.noDataContainer}>
              <Icon name="info-circle" size={24} color="#E74C3C" />
              <Text style={styles.noDataText}>
                Insufficient data for yearly view. Please use the app for at
                least a month.
              </Text>
            </View>
          );
        }
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#F8F9FA', '#F2F2F2']}
        style={styles.topSection}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('OptionScreen')}>
            <Icon name="gear" size={24} color="#E74C3C" />
          </TouchableOpacity>
          <View style={styles.statsContainer}>
            <View style={styles.currencyContainer}>
              <Icon name="dollar" size={16} color="#FFD700" />
              <Text style={styles.currencyText}>{balance}</Text>
            </View>
            <LevelDisplay />
          </View>
          <TouchableOpacity onPress={toggleMute} style={styles.volumeContainer}>
            <Icon
              name={isMuted ? 'volume-off' : 'volume-up'}
              size={32}
              color="#E74C3C"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <TouchableOpacity onPress={exportData} style={styles.exportIcon}>
            <Icon name="clipboard" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
        <Animatable.View animation="fadeInUp" style={styles.runnerSection}>
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
        </Animatable.View>
      </LinearGradient>
      <View style={styles.bottomSection}>
        <Animatable.Text animation="fadeInUp" style={styles.bottomHeader}>
          Your Steps Progress
        </Animatable.Text>
        <View style={styles.tabViewContainer}>
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{width}}
            renderTabBar={props => (
              <Animatable.View animation="fadeInUp" delay={400}>
                <TabBar
                  {...props}
                  style={{
                    backgroundColor: 'transparent',
                    elevation: 0,
                    shadowOpacity: 0,
                  }}
                  indicatorStyle={{
                    backgroundColor: '#E74C3C',
                    height: 3,
                    borderRadius: 3,
                  }}
                  labelStyle={{
                    textTransform: 'none',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                  activeColor="#E74C3C"
                  inactiveColor="#6C757D"
                />
              </Animatable.View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
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
          datasets: [{data: data}],
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
          style: {borderRadius: 16},
        }}
        bezier
        style={{paddingRight: 85}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},
  optionsIcon: {padding: 10},
  noOrderHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E74C3C',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  noOrderSubtext: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 10,
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 22,
  },
  stepCountText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    color: '#2C3E50',
  },
  topSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moneyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.95)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  volumeContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  moneyText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
  },
  exportIcon: {marginLeft: 10},
  runnerSection: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 6,
  },
  runnerImage: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  runnerTextContainer: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  almostThereText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E74C3C',
    textShadowColor: 'rgba(231, 76, 60, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  distanceText: {
    fontSize: 16,
    color: '#6C757D',
    marginTop: 5,
    lineHeight: 22,
  },
  kilometersText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2C3E50',
  },
  progressBar: {marginTop: 15},
  progressText: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 8,
    textAlign: 'right',
  },
  bottomSection: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 6,
  },
  bottomHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 15,
  },
  statsItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsLabel: {fontSize: 14, color: '#6C757D', marginBottom: 5},
  statsValue: {flexDirection: 'row', alignItems: 'flex-end'},
  statsNumber: {fontSize: 26, fontWeight: 'bold', color: '#2C3E50'},
  statsUnit: {fontSize: 16, color: '#6C757D', marginLeft: 5, marginBottom: 4},
  tabViewContainer: {flex: 1, marginBottom: 10},
  tabScene: {flex: 1, backgroundColor: 'white'},
  graphPlaceholder: {
    flex: 1,
    marginVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 200,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currencyText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  // Styles for the conditional no-data card.
  noDataContainer: {
    flex: 1,
    padding: 20,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default DashboardScreen;
