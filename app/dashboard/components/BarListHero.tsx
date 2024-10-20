import { BarList } from "../lib/graphComp/BarList"

const data = [
  { name: "/home", value: 843 },
  { name: "/imprint", value: 46 },
  { name: "/cancellation", value: 3 },
  { name: "/blocks", value: 108 },
  { name: "/documentation", value: 384 },
]

export const BarListHero = () => {
  return (
    <>
      <BarList className="w-full h-full py-2 px-2"
        data={data}
    
      />
    </>
  )
}