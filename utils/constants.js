import {
  EmojiHappyIcon,
  EmojiSadIcon,
  FireIcon,
  HeartIcon,
  ThumbUpIcon,
  XIcon,
} from '@heroicons/react/solid'

const CONTRACT_ADDRESS = "0x26822f79eD5EBCb543b21190B6E1bfE5dC5cdeff"

const MOODS = [
    { id: 0, name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
    { id: 1, name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
    { id: 2,  name: 'Happy', value: 'happy', icon: EmojiHappyIcon, iconColor: 'text-white', bgColor: 'bg-green-400' },
    { id: 3,  name: 'Sad', value: 'sad', icon: EmojiSadIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
    { id: 4,  name: 'Thumbsy', value: 'thumbsy', icon: ThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
    { id: 5,  name: 'I feel nothing', value: null, icon: XIcon, iconColor: 'text-gray-400', bgColor: 'bg-transparent' },
  ]

export { CONTRACT_ADDRESS, MOODS };