#!/usr/bin/env bash

set -o errexit

WORKSPACE_NANE=".usfs"
INITIAL_DIR="${PWD}"
API_URL_DEFAULT="https://localhost:5000";

function print_messasge_block {
	echo "------------------------------------------------------"
	echo -e "--- ${1}"
	echo "--- ${PWD}"
 	echo "------------------------------------------------------"
}

if [ "${API_URL}" = "" ]; then
  export API_URL=$API_URL_DEFAULT
  print_messasge_block "Required environment API_URL is not set.\nExporting default value: ${API_URL_DEFAULT}";
fi;

print_messasge_block "API_URL: ${API_URL}"

#
# Downloads a dependency from github
#
function download_repo {
	REPO=$1
	print_messasge_block "Downloading repo: '${REPO}'"
	{
		git clone https://github.com/cityofaustin/$REPO.git
	} || {
		echo "Repo already exists: ${REPO}"
	}
}


#
# Builds the repo (and copy output into dependency)
# $1 : String : the name of the repo
# $2..$n: String : the name of library that depends on $1
#
function build_repo {
	REPO=$1

	print_messasge_block "Building repo: '${REPO}'"

	cd "./${REPO}";

	echo "${PWD}";

	yarn;


	# Iterate for each dependency (if any)
	for i in "${@:2}"
	do
	    DEPENDENCY=$i
	    echo "	> Building: ${REPO}"
		echo "	> Repo's Dependency: '${DEPENDENCY}'"
		DEPENDENCY_BUILD="../${DEPENDENCY}/build/index.js"
		DEPENDENCY_DESTINATION="node_modules/@cityofaustin/$DEPENDENCY/build"
		echo "		>> Current Working Dir: '${PWD}'"
		echo "		>> Copying dependency: '${DEPENDENCY_BUILD}'"
		echo "		>> Into dependency path: '${DEPENDENCY_DESTINATION}'"
		cp 	$DEPENDENCY_BUILD $DEPENDENCY_DESTINATION
	done


	print_messasge_block "Building (yarn build) repo: ${REPO}"

	yarn build;

	print_messasge_block "Done"

	cd ..
}

#
# Extracts build output from $1..$n dependencies
# $1..$n : String : The name of the repo
#
function extract_libraries {
	print_messasge_block "Extracting Libraries"
	# Iterate for each dependency (if any)
	for DEPENDENCY in "${@}"
	do
		DEPENDENCY_BUILD="${WORKSPACE_NANE}/${DEPENDENCY}/build/index.js"
		DEPENDENCY_DESTINATION="node_modules/@cityofaustin/$DEPENDENCY/build"
		echo -e "\n		>> Dependency: '${DEPENDENCY}'"
		echo "		>> Current Working Dir: '${PWD}'"
		echo "		>> Copying dependency: '${DEPENDENCY_BUILD}'"
		echo "		>> Into dependency path: '${DEPENDENCY_DESTINATION}'"
		cp 	$DEPENDENCY_BUILD $DEPENDENCY_DESTINATION
	done
}

#
# Try to create the '.usfs' cache folder, or output existing message.
#
{
	mkdir "${WORKSPACE_NANE}";
} || {
	echo "Workspace already exists: ${WORKSPACE_NANE}"
}

cd "${WORKSPACE_NANE}";
print_messasge_block "Switched Workspace"


#
# First we download the repos
#
download_repo "usfs-components";
download_repo "officer-form-chapters";


#
# Then we build them
#
build_repo "usfs-components"
build_repo "officer-form-chapters" "usfs-components"

# Move back to the initial working directory
cd "${INITIAL_DIR}";


#
# Finally, we extract the build outputs into our current yarn project.
#
extract_libraries "usfs-components" "officer-form-chapters"

echo -e "\n\n"
