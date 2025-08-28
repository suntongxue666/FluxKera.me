'use client'

import { useState, useEffect } from 'react'

interface User {
  id: number
  username: string
  avatar: string
}

interface PurchaseActivity {
  user: User
  plan: 'Pro' | 'Max'
  timeAgo: string
}

const mockUsers: User[] = [
  { id: 1, username: 'alexander.chen@gmail.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 2, username: 'sarah.johnson@gmail.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b169?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 3, username: 'michael.brown@gmail.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 4, username: 'emma.wilson@gmail.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 5, username: 'david.garcia@gmail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 6, username: 'jennifer.lee@gmail.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 7, username: 'robert.martinez@gmail.com', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 8, username: 'lisa.anderson@gmail.com', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 9, username: 'james.taylor@gmail.com', avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 10, username: 'amanda.thomas@gmail.com', avatar: 'https://images.unsplash.com/photo-1521038199265-bc482db0f923?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 11, username: 'william.jackson@gmail.com', avatar: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 12, username: 'michelle.white@gmail.com', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 13, username: 'christopher.harris@gmail.com', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 14, username: 'stephanie.clark@gmail.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 15, username: 'matthew.rodriguez@gmail.com', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 16, username: 'jessica.lewis@gmail.com', avatar: 'https://images.unsplash.com/photo-1485893226505-9880b47e2e37?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 17, username: 'anthony.walker@gmail.com', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 18, username: 'nicole.hall@gmail.com', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 19, username: 'daniel.allen@gmail.com', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 20, username: 'lauren.young@gmail.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 21, username: 'kevin.king@gmail.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 22, username: 'rachel.wright@gmail.com', avatar: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 23, username: 'brandon.lopez@gmail.com', avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 24, username: 'megan.hill@gmail.com', avatar: 'https://images.unsplash.com/photo-1498551172505-8ee7ad69f235?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 25, username: 'jason.scott@gmail.com', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 26, username: 'kelly.green@gmail.com', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 27, username: 'tyler.adams@gmail.com', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 28, username: 'ashley.baker@gmail.com', avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 29, username: 'jordan.gonzalez@gmail.com', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=32&h=32&fit=crop&crop=face&auto=format' },
  { id: 30, username: 'christina.nelson@gmail.com', avatar: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=32&h=32&fit=crop&crop=face&auto=format' }
]

const generateRandomPurchaseActivity = (): PurchaseActivity => {
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]
  
  // Pro占70%，Max占30%
  const isPro = Math.random() < 0.7
  const plan = isPro ? 'Pro' : 'Max'
  
  // 生成随机时间：1分钟到24小时前
  const randomMinutes = Math.floor(Math.random() * (24 * 60)) + 1
  let timeAgo: string
  
  if (randomMinutes < 60) {
    timeAgo = `${randomMinutes} mins ago`
  } else {
    const hours = Math.floor(randomMinutes / 60)
    timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  
  return {
    user: randomUser,
    plan,
    timeAgo
  }
}

const maskUsername = (username: string): string => {
  const [name] = username.split('@')
  if (name.length <= 3) return `***`
  return `***${name.slice(3)}`
}

export default function PurchaseCarousel() {
  const [activities, setActivities] = useState<PurchaseActivity[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 生成10个不同的购买活动
    const generateActivities = () => {
      const newActivities: PurchaseActivity[] = []
      const usedUserIds = new Set<number>()
      
      while (newActivities.length < 10) {
        const activity = generateRandomPurchaseActivity()
        // 确保每个用户只出现一次
        if (!usedUserIds.has(activity.user.id)) {
          usedUserIds.add(activity.user.id)
          newActivities.push(activity)
        }
      }
      
      return newActivities
    }

    setActivities(generateActivities())
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (activities.length === 0) return

    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % activities.length)
        setIsVisible(true)
      }, 500) // 淡出淡入过渡时间
    }, 10000) // 每10秒切换

    return () => clearInterval(interval)
  }, [activities.length])

  if (activities.length === 0 || !isVisible) {
    return null
  }

  const currentActivity = activities[currentIndex]

  return (
    <div className="flex justify-center mb-12">
      <div className={`bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div className="flex items-center space-x-3">
          <img 
            src={currentActivity.user.avatar} 
            alt="User avatar" 
            className="w-8 h-8 rounded-full"
          />
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {maskUsername(currentActivity.user.username)}
            </span>
            <span className="text-sm text-gray-600">chose</span>
            <span className={`text-sm font-semibold ${currentActivity.plan === 'Pro' ? 'text-blue-600' : 'text-orange-600'}`}>
              {currentActivity.plan} Plan
            </span>
            <span className="text-sm text-gray-500">
              {currentActivity.timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}