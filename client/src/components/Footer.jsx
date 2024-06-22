import React from 'react'

function Footer() {
    return (
        <>
            <div className='w-full bg-[#10141F] py-4'>
                <div className="w-[90%] md:w-[70%] mx-auto flex flex-col gap-4 items-center justify-center">
                <div className="w-full text-lg font-['Changa_One',Impact,sans-serif] grid grid-cols-2 place-items-center sm:flex items-center gap-6 sm:gap-4 justify-center text-white">
                    <p className='uppercase border-b-[3px] leading-4 border-b-[#0000EE] hover:text-[#F91F6F] font-bold cursor-pointer'>Faq</p>
                    <p className='uppercase border-b-[3px] leading-4 border-b-[#0000EE] hover:text-[#F91F6F] font-bold cursor-pointer'>How to play</p>
                    <p className='uppercase border-b-[3px] leading-4 border-b-[#0000EE] hover:text-[#F91F6F] font-bold cursor-pointer'>t&c</p>
                    <p className='uppercase border-b-[3px] leading-4 border-b-[#0000EE] hover:text-[#F91F6F] font-bold cursor-pointer'>kyc</p>
                    <p className='uppercase border-b-[3px] leading-4 border-b-[#0000EE] hover:text-[#F91F6F] font-bold cursor-pointer col-span-2'>responsible gaming</p>
                </div>
                <div className="text-center text-white text-[14px] flex flex-col gap-2">
                    <p>Legal Disclaimer: $MEP is a meme coin with no intrinsic value or expectation of financial return. $MEP is completely ruthless and for entertainment purposes only. When you purchase $MEP, you are agreeing that you have seen this disclaimer. Also you don't need tokens to join the movement. Enjoy.</p>
                </div>
                </div>
            </div>
        </>
    )
}

export default Footer
