import React from 'react'
import { useDispatch } from 'react-redux'
import { setAlertMessage } from '../store/slice'

function Alert({ message, type }) {

    const dispatch = useDispatch()

    return (
        <div className='w-[19rem] md:w-[60%] 2xl:w-[30%] z-50 flex fex-col items-center justify-center bg-[#10141F] h-10 border-2 border-[#C1D69A] px-2 py-2 text-center rounded-lg fixed mx-auto top-6 left-[50%] translate-x-[-50%] transition-all duration-300 ease-in'>
            <div className="flex flex-col items-center justify-center">
                <p className='text-lg text-white'>{message}&nbsp;</p>
                <p className="absolute right-[4%] top-[2px] md:top-0 text-2xl text-[#C1D69A] cursor-pointer" onClick={() => dispatch(setAlertMessage({}))}>&times;</p>
            </div>
        </div>
    )
}

export default Alert
