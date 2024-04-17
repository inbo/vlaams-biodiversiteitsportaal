Vagrant.configure("2") do |config|

  config.vm.provider "virtualbox" do |v|
    v.memory = 8196
    v.cpus = 4
  end

  config.vm.provision "shell" do |s|
    ssh_pub_key = File.readlines("#{Dir.home}/.ssh/id_ed25519.pub").first.strip
    s.inline = <<-SHELL
      echo #{ssh_pub_key} >> /home/vagrant/.ssh/authorized_keys
    SHELL
  end

  config.vm.define "vm-1" do |node|
    node.vm.box = "ubuntu/bionic64"
    node.vm.network "private_network", ip: "192.168.56.10"
  end

  config.vm.define "vm-2" do |node|
    node.vm.box = "ubuntu/bionic64"
    node.vm.network "private_network", ip: "192.168.56.11"
  end

  # config.vm.define "vm-3" do |db|
  #   db.vm.box = "ubuntu/bionic64"
  #   config.vm.network "private_network", ip: "192.168.56.12"
  # end

  # config.vm.define "vm-4" do |db|
  #   db.vm.box = "ubuntu/bionic64"
  #   config.vm.network "private_network", ip: "192.168.56.13"
  # end

end