"use client";

type Props = {
  lighting: string;

  setLighting: (
    value: string
  ) => void;

  cameraAngle: string;

  setCameraAngle: (
    value: string
  ) => void;

  aspectRatio: string;

  setAspectRatio: (
    value: string
  ) => void;

  realism: number;

  setRealism: (
    value: number
  ) => void;

  lightingOptions: string[];

  cameraAngles: string[];

  aspectRatios: string[];
};

export default function GeneratorControls({
  lighting,
  setLighting,
  cameraAngle,
  setCameraAngle,
  aspectRatio,
  setAspectRatio,
  realism,
  setRealism,
  lightingOptions,
  cameraAngles,
  aspectRatios,
}: Props) {

  return (

    <div>

      {/* CONTROLS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

        {/* LIGHTING */}

        <div>

          <label className="block text-sm text-gray-400 mb-3">
            Lighting
          </label>

          <select
            value={lighting}

            onChange={(e) =>
              setLighting(
                e.target.value
              )
            }

            className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-4 py-4"
          >

            {lightingOptions.map(
              (option) => (

                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>

              )
            )}

          </select>

        </div>

        {/* CAMERA */}

        <div>

          <label className="block text-sm text-gray-400 mb-3">
            Camera Angle
          </label>

          <select
            value={cameraAngle}

            onChange={(e) =>
              setCameraAngle(
                e.target.value
              )
            }

            className="w-full bg-black border border-[#1a1a1a] rounded-2xl px-4 py-4"
          >

            {cameraAngles.map(
              (option) => (

                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>

              )
            )}

          </select>

        </div>

      </div>

      {/* ASPECT */}

      <div className="mb-8">

        <label className="block text-sm text-gray-400 mb-3">
          Aspect Ratio
        </label>

        <div className="flex flex-wrap gap-3">

          {aspectRatios.map(
            (ratio) => (

              <button
                key={ratio}

                onClick={() =>
                  setAspectRatio(
                    ratio
                  )
                }

                className={`px-5 py-3 rounded-2xl transition ${
                  aspectRatio ===
                  ratio
                    ? "bg-[#c7a36a] text-black"
                    : "bg-black border border-[#1a1a1a]"
                }`}
              >

                {ratio}

              </button>

            )
          )}

        </div>

      </div>

      {/* REALISM */}

      <div className="mb-8">

        <div className="flex items-center justify-between mb-3">

          <label className="text-sm text-gray-400">
            Realism Strength
          </label>

          <span className="text-[#c7a36a]">
            {realism}%
          </span>

        </div>

        <input
          type="range"
          min="0"
          max="100"

          value={realism}

          onChange={(e) =>
            setRealism(
              Number(
                e.target.value
              )
            )
          }

          className="w-full"
        />

      </div>

    </div>
  );
}