"use client"

import React, { useState, useEffect, MouseEventHandler } from 'react';
import { FaPlay, FaPause, FaVolumeUp} from "react-icons/fa"
import { IoPlaySkipForward, IoPlaySkipBack } from "react-icons/io5";
import { useAudioURL, useCurrentBookInfo, useBookInfo } from '@/zustand/state';
import Toast from './Toast';
import Loader from './Loader';
import Link from 'next/link';
import { trimString } from '@/utils/utilFunctions';

interface propType {
    onPlay: MouseEventHandler<SVGElement>;
    onPause: MouseEventHandler<SVGElement>;
    isPlaying: boolean;
    onVolumeChange: Function;
    onSeek: Function;
    currentTime: number;
    duration: number;
    canPlay: boolean;
    playbackSpeed: number;
    setPlaybackSpeed: React.Dispatch<React.SetStateAction<number>>;
}

export default function AudioController({ onPlay, onPause, isPlaying, onVolumeChange, onSeek, currentTime, duration, canPlay,playbackSpeed, setPlaybackSpeed }: propType) {
    const [volume, setVolume] = useState(100);
    const [isSeeking, setIsSeeking] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const { audioInfo, globalAudioURL, updateGlobalAudioURL, updateAudioInfo, updateIsPlaying } = useAudioURL((state: any) => state)
    const { currentBookInfo } = useCurrentBookInfo((state: any) => state)
    const { bookInfo } = useBookInfo((state: any) => state)

    useEffect(() => {
        setVolume(100);
    }, [isPlaying]);

    useEffect(() => {
        if (showToast) {
            const closeToast = setTimeout(() => {
                setShowToast(false)
            }, 3000)
            return () => {
                clearTimeout(closeToast)
            }
        }
    }, [showToast])

    function handleVolumeChange(e: any) {
        const newVolume = e.target.value;
        setVolume(newVolume);
        onVolumeChange(newVolume / 100);
    };

    function handleSeek(e: any) {
        const newTime = e.target.value;
        onSeek(newTime);
    };

    const formatTime = (time: number) => {
        if (time === 0) {
            return "--:--"
        }
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleNextAudio = () => {
        if (audioInfo.audioIndex < currentBookInfo.episodes.length - 1) {
            const nextAudio = currentBookInfo.episodes[audioInfo.audioIndex + 1]
            // console.log(nextAudio)
            updateGlobalAudioURL(nextAudio.epURL)
            updateAudioInfo({
                audioName: nextAudio.epTitle,
                audioAuthor: "",
                bookId: audioInfo.bookId,
                audioIndex: audioInfo.audioIndex + 1,
            })
        }
    }

    const handlePrevAudio = () => {
        if (audioInfo.audioIndex > 0) {
            const prevAudio = currentBookInfo.episodes[audioInfo.audioIndex - 1]
            updateGlobalAudioURL(prevAudio.epURL)
            updateAudioInfo({
                audioName: prevAudio.epTitle,
                audioAuthor: "",
                bookId: audioInfo.bookId,
                audioIndex: audioInfo.audioIndex - 1,
            })
        }
    }

    return (
        <section className='flex flex-col lg:mb-2'>
            <div className="flex flex-col w-full min-h-[56px] md:justify-between px-4 rounded-md 
            lg:bg-gray-800 
            lg:bg-clip-padding lg:backdrop-filter lg:backdrop-blur-md lg:bg-opacity-20">
                <div className="flex flex-row items-center justify-between min-h-[54px]">
                    <div className='w-[30ch] lg:w-auto'>
                        <Link className='text-sm leading-tight font-raleway font-semibold' href={audioInfo.bookId ? audioInfo.bookId : "#"}>{currentBookInfo && trimString(currentBookInfo.bookTitle, 20) + "   >   " + audioInfo.audioName}</Link>
                    </div>
                    <div className='flex flex-col items-center self-center'>
                        <div className='flex flex-row gap-3 self-center'>
                            <IoPlaySkipBack
                                className='cursor-pointer'
                                onClick={handlePrevAudio}
                                color={globalAudioURL && audioInfo.audioIndex > 0 ? '#ffffff' : 'gray'} />
                            {isPlaying && canPlay
                                ? <FaPause onClick={onPause} className={`cursor-pointer`} />
                                : !isPlaying ? <FaPlay
                                    onClick={globalAudioURL
                                        ? onPlay
                                        : () => {
                                            setShowToast(true)
                                        }}
                                    className={`cursor-pointer`}
                                    color={globalAudioURL ? '#ffffff' : 'gray'} />
                                    : isPlaying && !canPlay
                                        ? <Loader />
                                        : null
                            }
                            <IoPlaySkipForward
                                className='cursor-pointer'
                                onClick={handleNextAudio}
                                color={globalAudioURL && audioInfo.audioIndex < currentBookInfo.episodes.length - 1 ? '#ffffff' : 'gray'} />
                        </div>
                        <div className='flex flex-row items-center gap-3'>
                            <span className={`${currentTime === 0 ? "text-gray-400" : "text-white"} lg:hidden`}>{formatTime(currentTime)}</span>
                            <input
                                type="range"
                                min="0"
                                max={duration}
                                value={isSeeking ? currentTime : currentTime}
                                onMouseDown={() => setIsSeeking(true)}
                                onMouseUp={(e) => { setIsSeeking(false); handleSeek(e); }}
                                onChange={handleSeek}
                                className={`h-[2px] ${!globalAudioURL ? "accent-gray-400" : "accent-yellow-500"} w-72 outline-none border-none lg:hidden`}
                            />
                            <span className={`${currentTime === 0 ? "text-gray-400" : "text-white"} lg:hidden`}>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className='flex flex-row gap-3 items-center w-[30ch] justify-end lg:hidden'>
                        <FaVolumeUp />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="h-[2px] accent-yellow-500"
                        />
                    </div>
                    {/* playbackSpeed */}
                    <div className='flex flex-row items-center gap-3'>
                       <select className='bg-transparent text-white' value={playbackSpeed} onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}>
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                    </div>                     
                </div>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={isSeeking ? currentTime : currentTime}
                    onMouseDown={() => setIsSeeking(true)}
                    onMouseUp={(e) => { setIsSeeking(false); handleSeek(e); }}
                    onChange={handleSeek}
                    className="hidden lg:block h-[2px] bg-gray-500 accent-yellow-500 rounded-md"
                />
            </div>
            {showToast && <Toast toast='Please select an audiobook first' type='error' />}
        </section>
    );
};